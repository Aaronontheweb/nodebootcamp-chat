
/**
 * Module dependencies.
 */

var express = require('express')
  , sessions = require('cookie-sessions')
  , mapper = require('./helpers/mapper')
  , messageLog = require('./models/chatlog').chatLog;

var app = module.exports = express.createServer();
var chatLog = new messageLog();
chatLog.init('YOUR AZURE STORAGE ACCOUNT', 'YOUR API KEY');
var io = require('socket.io').listen(app);

//Dynamic view helpers
app.dynamicHelpers({
    session: function (req, res) {
        return req.session;
    },
    flash: function(req, res){
      if(typeof(req.session) == 'undefined'){
        return undefined;
      }
      else{
        return req.flash();
      }
    }
});

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

var usernames = [];

var logMessage = function(message){
  chatLog.save('main', message, function(error, savedMessage){
      if(error){ //If for some reason we were unable to save the chat message
        console.log(error.message);
      }
    });
}

/* socket-io magic */
io.sockets.on('connection', function (socket) {
  
  socket.on('sendchat', function (data) {
    var message = mapper.createChatMessage(socket.username, data);

    io.sockets.emit('updatechat', message);

    logMessage(message);  
  });

  socket.on('newuser', function(username){
    socket.username = username;
    usernames[username] = username;

    //Load the chat history while we're doing everything else...
    chatLog.getMessages('main', 30, function(error, messages){
      if(error) return console.log(error.message);
      if(messages && messages.length){
        //Push the messages to the client if we were able to load them successfully
        socket.emit('loadmessages', messages);
      }
    });

    socket.emit('updatechat', mapper.createChatMessage('SERVER', 'you have connected'));

    var message = mapper.createChatMessage('SERVER', username + ' has connected');
    socket.broadcast.emit('updatechat', message);
    logMessage(message);

    socket.emit('loadusers', mapper.mapArray(usernames, mapper.createUser));
    socket.broadcast.emit('adduser', mapper.createUser(username));
  });

  socket.on('disconnect', function(){
    delete usernames[socket.username];
    io.sockets.emit('removeuser', mapper.createUser(socket.username));
    var message = mapper.createChatMessage('SERVER', socket.username + ' has disconnected')
    socket.broadcast.emit('updatechat', message);

    logMessage(message);
  });

});

// Routes
require("./routes/site")(app); //All of the root-level routes
require("./routes/user")(app); //All of the user-auth routes

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
