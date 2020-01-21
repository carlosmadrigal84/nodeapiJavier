'use strict';
module.exports = function(roleToCheck) {

  return function(req, res, next) {
    if (!req.session.authUser) {
      res.redirect('/login');
      return;
    }
    // comprobar roles
    // const usuario = await Usuario.findById(req.session.authUser._id);
    // if (!usuario.hasRole(roleToCheck)) {
    //   res.redirect('/login');
    //   return;
    // }

    next();
  };

}
