'use strict';
const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Creamos un Controller que nos servirá para asociar rutas en app.js

class LoginController {

  /**
   * GET /login
   */
  index(req, res, next) {
    res.locals.email = '';
    res.locals.error = '';
    res.render('login');
  }

  /**
   * POST /login
   */
  async post(req, res, next) {
    try {


      // recoger parámetros del curpo de la petición
      const email = req.body.email;
      const password = req.body.password;

      // buscar el usuario en la base de datos
      const usuario = await Usuario.findOne({ email: email });

      if (!usuario || !await bcrypt.compare(password, usuario.password)) {
        res.locals.email = email;
        res.locals.error = res.__('Invalid credentials');
        res.render('login');
        return;
      }

      // si encuentro el usuario, y coincide la password
      req.session.authUser = {
        _id: usuario._id,
        //roles: [usuario.roles]
      };

      res.redirect('/privado');

      const result = await usuario.sendEmail('admin@example.com', 'Prueba email', 'Has entrado en <b>NodeAPI</b>');
      console.log(result);

    } catch(err) {
      next(err);
    }
  }

  /**
   * GET /logout
   */
  logout(req, res, next) {
    // delete req.session.authUser;
    req.session.regenerate(err => {
      if (err) {
        next(err);
        return;
      }
      res.redirect('/');
    });
  }

  async loginJWT(req, res, next) {
    try {
      // recoger credenciales de la petición
      const email = req.body.email;
      const password = req.body.password;

      // buscar el usuario en BD
      const usuario = await Usuario.findOne({ email: email });

      // si no lo encontramos le decimos que no
      if (!usuario || !await bcrypt.compare(password, usuario.password)) {
        res.json({ success: false, error: res.__('Invalid credentials') });
        return;
      }

      // creamos un JWT
      // no meter una instancia de mongoose en el Payload!!!!!!!!
      const token = jwt.sign({ _id: usuario._id }, process.env.JWT_SECRET, {
        expiresIn: '2d'
      });

      // respondemos
      res.json({ success: true, token: token });

    } catch(err) {
      next(err);
    }
  }

}

module.exports = new LoginController();
