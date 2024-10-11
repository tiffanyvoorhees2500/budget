const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  accountBeginningBalance: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Account', accountSchema);
