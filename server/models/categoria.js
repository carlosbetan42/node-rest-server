const mongoose = require('mongoose');

let categoriaSchema = new mongoose.Schema({
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria']
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }
});


module.exports = mongoose.model('Categoria', categoriaSchema);