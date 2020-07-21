const jwt = require('jsonwebtoken');

// ========================
// Verificar Token
// ========================

const verificaToken = (req, res, next) => {
  const token = req.get('token');

  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err: {
          message: 'Token no válido'
        }
      });
    }
    req.usuario = decoded;
  });

  next();
};

// ========================
// Verificar Admin Role
// ========================

const verificaAdminRoles = (req, res, next) => {
  const usuario = req.usuario.data;

  if (usuario.role !== 'ADMIN_ROLE') {
    return res.status(401).json({
      ok: false,
      err: {
        message: 'El usuario no es administrador'
      }
    });
  }

  next();
};

// ========================
// Verificar Token para imagen
// ========================

const verificaTokenImg = (req, res, next) => {
  const token = req.query.token;

  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err: {
          message: 'Token no válido'
        }
      });
    }
    req.usuario = decoded;
  });

  next();
};

module.exports = {
  verificaToken,
  verificaAdminRoles,
  verificaTokenImg
};