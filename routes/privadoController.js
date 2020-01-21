'use strict';

class PrivadoController {
  index(req, res, next) {
    res.render('privado');
  }

}

module.exports = new PrivadoController();
