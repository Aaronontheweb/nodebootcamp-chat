/* Helper function that ensures that our HTTP session cookie is alive */
exports.initializeSession = function (req, res, next) {
console.log("Checking session");
  if(typeof(req.session) == 'undefined'){
    req.session = {};
    console.log("Session initialized");
  }
  next();
}