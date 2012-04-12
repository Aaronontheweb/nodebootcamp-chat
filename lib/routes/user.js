/*
 * Module for handling user authentication stuff
 */

module.exports = function(application){

    app.get('/user/login', function(req, res){
        res.render('user/login', {locals:{
        title: 'Login to Node Bootcamp Chat',
        redir: req.query.redir
    }});

    app.post('/user/login', function(req, res){
        //Set the username based on what we received from the form
        req.session.username = req.body.chatHandle;
        req.flash('info', 'Successfully logged in as _%s_', req.session.username);
        res.redirect(req.body.redir || '/');
    });
}