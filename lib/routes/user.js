/*
 * Module for handling user authentication stuff
 */

 //Module dependencies
 var initializeSession = require("../helpers/initializeSession").initializeSession;

module.exports = function(app){

    app.get('/user/login', initializeSession, function(req, res){
        res.render('user/login', {locals:{
        title: 'Login to Node Bootcamp Chat',
        redir: req.query.redir}});
    });

    app.post('/user/login', initializeSession, function(req, res){
        var userName = req.body.chatHandle;
        console.log("Logged in user with name %s", userName);

        //Set the username based on what we received from the form
        req.session.userName = userName;
        req.flash('info', 'Successfully logged in as _%s_', userName);
        console.log(req.session);
        res.redirect(req.body.redir || '/');
    });
}