const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  date: String,
  sku: String,
  msku: String,
  quantity: Number,
});

module.exports = mongoose.model('Sale', salesSchema);
