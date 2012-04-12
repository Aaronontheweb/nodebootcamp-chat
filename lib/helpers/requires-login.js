
/* Helper function that ensures that creates a redirect for protected areas */
exports.requiresLogin = function(req, res, next) {
  if(req.session.userName) {
    next();
  } else {
    res.redirect('/user/login?redir=' + req.url);
  }
}