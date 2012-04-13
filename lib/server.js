
/**
 * Module dependencies.
 */

var express = require('express')
  , sessions = require('cookie-sessions')

var app = module.exports = express.createServer();

var io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(sessions({secret: '212w4sfa-tgdfgv45-sdf34'}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.set('view options', { pretty: true });
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});

//Configure socket.io
io.configure(function () {
  //IIS doesn't yet support WebSockets, so using XHR-polling will improve client latency on Azure (no socket failovers)
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

//Catch-all routes
//app.all('*?', initializeSession);

var usernames = {};

/* socket-io magic */
io.sockets.on('connection', function (socket) {
  
  socket.on('sendchat', function (data) {
    io.sockets.emit('updatechat', socket.username, data);
  });

  socket.on('adduser', function(username){
    socket.username = username;
    usernames[username] = username;
    socket.emit('updatechat', 'SERVER', 'you have connected');
    socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
    io.sockets.emit('updateusers', usernames);
  });

  socket.on('disconnect', function(){
    delete usernames[socket.username];
    io.sockets.emit('updateusers', usernames);
    socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
  });

});

// Routes
require("./routes/site")(app); //All of the root-level routes
require("./routes/user")(app); //All of the user-auth routes

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
