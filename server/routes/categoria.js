const express = require('express');
const { verificaToken, verificaAdminRoles } = require('../middlewares/autenticacion');
const app = express();
const Categoria = require('../models/categoria');

//
// Mostrar todas las categorías
//
app.get('/categoria', verificaToken, (req, res) => {
  Categoria
    .find({})
    .sort('descripcion')
    .populate('usuario', 'nombre email')
    .exec((err, categorias) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        categorias
      });
    });
});

//
// Mostrar una categoría por id
//
app.get('/categoria/:id', verificaToken, (req, res) => {
  const id = req.params.id;

  Categoria.findById(id, (err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'El id no existe'
        }
      });
    }

    res.json({
      ok: true,
      categoria: categoriaDB
    });
  });
});

//
// Crear nueva categoría
//
app.post('/categoria', [verificaToken], (req, res) => {
  // regresa la nueva categoria
  // req.usuario._id
  const body = req.body;

  const categoria = new Categoria({
    descripcion: body.descripcion,
    usuario: req.usuario.data._id
  });

  categoria.save((err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      categoria: categoriaDB
    });
  });
});


//
// Actualizar una categoría
//
app.put('/categoria/:id', (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const descCategoria = {
    description: body.description
  }

  Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      categoria: categoriaDB
    });
  });
});

//
// Eliminar una categoría
//
app.delete('/categoria/:id', [verificaToken, verificaAdminRoles], (req, res) => {
  // solo un administrador puede borrar categorías
  const id = req.params.id;

  Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'El id no existe'
        }
      });
    }

    res.json({
      ok: true,
      message: 'Categoría Borrada'
    });
  });
});

module.exports = app;