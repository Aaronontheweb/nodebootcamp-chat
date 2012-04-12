
/* Helper function that ensures that creates a redirect for protected areas */
exports.requiresLogin = function(req, res, next) {
  if(req.session && req.session.userName && req.session.userName.length > 0) {
    next();
  } else {
    res.redirect('/user/login?redir=' + req.url);
  }
}