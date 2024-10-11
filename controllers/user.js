const User = require('../models/User');

const getAll = async (req, res) => {
  try {
    const users = await User.find();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSingle = async (req, res) => {
  try {
    const user = await User.find({ _id: req.params.id });
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//DELETE
const deleteSingle = async (req, res) => {
    /*
      #swagger.tags=['Transactions']
    */
    const transactionId = req.params.transactionId;
  
    try {
      await Transaction.findByIdAndDelete(transactionId);
  
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

module.exports = {
  getAll,
  getSingle,
  deleteSingle,
};
