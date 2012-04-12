/*
 * Module dependencies
 */

var requiresLogin = require('../helpers/requireLogin').requiresLogin;

module.exports = function(app){

	/*
	 * GET home page (requires the user to be logged in)
	 */
	app.get("/", requiresLogin, function(req, res){
		res.render('index', { title: 'Express' })
	});
};