/*
 * Module dependencies
 */

var requiresLogin = require('./helpers/requires-login').requiresLogin;

module.exports = function(applicaiton){

	/*
	 * GET home page (requires the user to be logged in)
	 */
	app.get("/", requiresLogin, function(req, res){
		res.render('index', { title: 'Express' })
	});
};