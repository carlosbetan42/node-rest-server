const express = require('express');
const { verificaToken } = require("../middlewares/autenticacion");

const app = express();
const Producto = require('../models/producto');

// =============================
// Obtener productos
// =============================
app.get('/productos', verificaToken, (req, res) => {
  // trae todos los productos
  // populate: usuario categoria
  // paginado

  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 5;
  limite = Number(limite);

  desde = desde * limite;

  Producto
    .find({ disponible: true })
    .skip(desde)
    .limit(limite)
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        productos
      });
    });
});

// =============================
// Obtener un producto por ID
// =============================
app.get('/productos/:id', verificaToken, (req, res) => {
  // populate: usuario categoria
  const id = req.params.id;

  Producto.findById(id)
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec((err, productoDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }

      if (!productoDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: 'ID no existe'
          }
        });
      }

      res.json({
        ok: true,
        producto: productoDB
      });
    });
});

// =============================
// Buscar productos
// =============================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
  const termino = req.params.termino;

  const regex = new RegExp(termino, 'i');

  Producto.find({ nombre: regex })
    .populate('categoria', 'descripcion')
    .exec((err, productosDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        productos: productosDB
      });
    });
});


// =============================
// Crear un nuevo producto
// =============================
app.post('/productos', verificaToken, (req, res) => {
  // grabar el usuario
  // grabar una categoria del listado
  const { nombre, precioUni, descripcion, disponible, categoria } = req.body;

  const producto = new Producto({
    nombre,
    precioUni,
    descripcion,
    disponible,
    categoria,
    usuario: req.usuario.data._id
  });

  producto.save((err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err
      });
    }

    res.json({
      ok: true,
      producto: productoDB
    });
  });
});

// =============================
// Actualizar un producto
// =============================
app.put('/productos/:id', verificaToken, (req, res) => {
  // grabar el usuario
  // grabar una categoria del listado

  const id = req.params.id;
  const body = req.body;

  Producto.findById(id, (err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'El ID no existe'
        }
      });
    }

    productoDB.nombre = body.nombre;
    productoDB.precioUni = body.precioUni;
    productoDB.descripcion = body.descripcion;
    productoDB.disponible = body.disponible;
    productoDB.categoria = body.categoria;

    productoDB.save((err, productoGuardado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        producto: productoGuardado
      });
    });
  });
});

// =============================
// Borrar un producto
// =============================
app.delete('/productos/:id', verificaToken, (req, res) => {
  const id = req.params.id;

  Producto.findById(id, (err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: 'El ID no existe'
        }
      });
    }

    productoDB.disponible = false;

    productoDB.save((err, productoGuardado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        message: 'Producto Borrado'
      });
    });
  });
});

module.exports = app;