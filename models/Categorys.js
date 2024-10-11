const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  categoryBudgetLimit: Number,
});

module.exports = mongoose.model('Category', categorySchema);
