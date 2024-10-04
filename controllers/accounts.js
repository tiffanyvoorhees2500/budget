const mongoose = require('../db/connection');
const csv = require('csvtojson');
const Account = require('../models/account');

const getAll = async (req, res) => {
  try {
    const accounts = await Account.find();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSingle = async (req, res) => {
  try {
    const account = await Account.find({ transactionId: req.params.id });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//DELETE
const deleteSingle = async (req, res) => {
  const id = req.params.id;

  try {
    await Account.deleteMany({ transactionId: id });
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
