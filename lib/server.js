
/**
 * Module dependencies.
 */

var express = require('express')
  , sessions = require('cookie-sessions')

var app = module.exports = express.createServer();

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

//Catch-all routes
//app.all('*?', initializeSession);

// Routes
require("./routes/site")(app); //All of the root-level routes
require("./routes/user")(app); //All of the user-auth routes

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
