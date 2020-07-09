const express = require('express');
const Usuario = require('../models/usuario');
const app = express();

const bcrypt = require('bcrypt');
const _ = require('underscore');

app.get('/usuario', (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 5;
  limite = Number(limite);

  desde = desde * limite;

  Usuario
    .find({ estado: true }, 'nombre email role estado google img')
    .skip(desde)
    .limit(limite)
    .exec((err, usuarios) => {
      if (err) {
        res.status(400).json({
          ok: false,
          err
        });
      }

      Usuario.count({ estado: true }, (err, conteo) => {
        res.json({
          ok: true,
          usuarios,
          cuantos: conteo
        });
      });
    });
});

app.post('/usuario', async (req, res) => {
  const body = req.body;

  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role
  });

  try {
    const usuarioDB = await usuario.save();

    res.json({
      ok: true,
      usuario: usuarioDB
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      err
    });
  }
});

app.put('/usuario/:id', async (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

  try {
    const usuarioDB = await Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    res.json({
      ok: true,
      usuario: usuarioDB
    });
  } catch (err) {
    res.status(400).json({
      ok: false,
      err
    });
  }
});

app.delete('/usuario/:id', async (req, res) => {
  let id = req.params.id;

  try {
    //const usuarioBorrado = await Usuario.findByIdAndRemove(id);
    //if (!usuarioBorrado) throw Error();
    const usuarioBorrado = await Usuario.findByIdAndUpdate(id, { estado: false }, { new: true });
    if (!usuarioBorrado) throw Error();
    res.json({
      ok: true,
      usuario: usuarioBorrado
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: {
        message: 'Usuario no encontrado'
      }
    });
  }
});

module.exports = app;