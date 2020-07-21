const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  safeFileNames: true,
  preserveExtension: true
}));

app.put('/upload/:tipo/:id', (req, res) => {
  const { tipo, id } = req.params;

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'No se ha seleccionado ningún archivo'
      }
    });
  }

  // Valida tipo
  const tiposValidos = ['productos', 'usuarios'];

  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Las tipos permitidos son ' + tiposValidos.join(', ')
      }
    });
  }

  const archivo = req.files.archivo;
  const nombreCortado = archivo.name.split('.');
  const extension = nombreCortado[nombreCortado.length - 1];

  // Extensiones permitidas
  const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

  if (extensionesValidas.indexOf(extension) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
        ext: extension
      }
    });
  }

  // Cambiar nombre al archivo
  const nombreArchivo = `${id}-${new Date().getTime()}.${extension}`;
  archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err
      });
    }

    // Aqui imagen cargada
    if (tipo === 'usuarios') {
      imagenUsuario(id, res, nombreArchivo, tipo);
    } else {
      imagenProducto(id, res, nombreArchivo, tipo);
    }
  })
});

const imagenUsuario = (id, res, nombreArchivo, tipo) => {
  Usuario.findById(id, (err, usuarioDB) => {
    if (err) {
      borraArchivo(nombreArchivo, tipo);
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!usuarioDB) {
      borraArchivo(nombreArchivo, tipo);
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Usuario no existe'
        }
      });
    }

    borraArchivo(usuarioDB.img, tipo);
    usuarioDB.img = nombreArchivo;

    usuarioDB.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        usuario: usuarioGuardado,
        img: nombreArchivo
      });
    });
  });
}

const imagenProducto = (id, res, nombreArchivo, tipo) => {
  Producto.findById(id, (err, productoDB) => {
    if (err) {
      borraArchivo(nombreArchivo, tipo);
      return res.status(500).json({
        ok: false,
        err
      });
    }

    if (!productoDB) {
      borraArchivo(nombreArchivo, tipo);
      return res.status(400).json({
        ok: false,
        err: {
          message: 'Producto no existe'
        }
      });
    }

    borraArchivo(productoDB.img, tipo);
    productoDB.img = nombreArchivo;

    productoDB.save((err, productoGuardado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err
        });
      }

      res.json({
        ok: true,
        usuario: productoGuardado,
        img: nombreArchivo
      });
    });
  });
}

const borraArchivo = (nombreImagen, tipo) => {
  const pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
  if (fs.existsSync(pathImagen)) {
    fs.unlinkSync(pathImagen);
  }
}

module.exports = app;