const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  transactionAmount: {
    type: Number,
    required: true,
  },
  transactionDate: {
    type: Date,
    required: true,
  },
  transactionDescription: {
    type: String,
    required: true,
  },
  splits: [
    {
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
      splitAmount: {
        type: Number,
        required: true,
      },
      splitNote: String,
    },
  ],
});

module.exports = mongoose.model('Transaction', transactionSchema);
