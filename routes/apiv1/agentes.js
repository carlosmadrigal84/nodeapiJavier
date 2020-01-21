'use strict';

const express = require('express');
const router = express.Router();

const Agente = require('../../models/Agente');
const jwtAuth = require('../../lib/jwtAuth');

//router.use(jwtAuth());

/**
 * GET /agentes
 * Devuelve una lista de agentes
 * Por ejemplo
 *  http://localhost:3000/apiv1/agentes?limit=2&skip=2&fields=name age -_id
 */
router.get('/', async (req, res, next) => {
  // Agente.find().exec((err, agentes) => {
  //   if (err) {
  //     next(err); // ecalar el error al gestor de errores
  //     return;
  //   }
  //   res.json({ success: true, agentes: agentes });
  // });
  try {

    const name = req.query.name;
    const age = req.query.age;
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);
    const fields = req.query.fields;
    const sort = req.query.sort;

    const filter = {};

    if (name) {
      filter.name = name;
    }

    if (typeof age !== 'undefined') {
      filter.age = age;
    }

    const agentes = await Agente.list({ filter: filter, skip, limit, fields, sort});

    res.json({ success: true, results: agentes });

  } catch (err) {
    next(err);
  }
});

/**
 * GET /agentes:id
 * Obtiene un agente
 */
router.get('/:id', async (req, res, next) => {
  try {
    const _id = req.params.id;

    const agente = await Agente.findById(_id).exec();

    if (!agente) {
      res.status(404).json({ success: false });
      return;
    }

    res.json({ success: true, result: agente });

  } catch(err) {
    next(err);
  }
})

/**
 * POST /agentes
 * Crear un agente
 */
router.post('/', async (req, res, next) => {
  try {
    const data = req.body;

    const agente = new Agente(data);

    const agenteGuardado = await agente.save();

    res.json({ success: true, result: agenteGuardado });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /agentes:id
 * Actualiza un agente
 */
router.put('/:id', async (req, res, next) => {
  try {
    const _id = req.params.id;
    const data = req.body;

    const agenteGuardado = await Agente.findOneAndUpdate({_id: _id}, data, { new: true }).exec();
    // new: true --> hace que retorne la versión del agente guardada en la base de datos

    res.json({ success: true, result: agenteGuardado });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /agentes:id
 * Elimina un agente
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const _id = req.params.id;

    await Agente.deleteOne({ _id: _id}).exec();

    res.json({ success: true });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
