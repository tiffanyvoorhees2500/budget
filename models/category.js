const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  categoryName: {
    type: String,
    required: true,
  },
  categoryBudgetLimit: Number,
});

module.exports = mongoose.model('Category', categorySchema);
