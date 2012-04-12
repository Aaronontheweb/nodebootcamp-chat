
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
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
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

/* Helper function that ensures that our HTTP session cookie is alive */
function initializeSession(req, res, next) {
  if(typeof(req.session) == 'undefined'){
    req.session = {};
  }
  next();
}

//Catch-all routes
app.all('/*?', initializeSession);

// Routes
require("./routes/root")(app); //All of the root-level routes

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
