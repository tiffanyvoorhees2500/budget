const mongoose = require('../db/connection');
const Category = require('../models/category');

const getAll = async (req, res) => {
  try {
    const categories = await Category.find();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSingle = async (req, res) => {
  try {
    const category = await Category.find({ _id: req.params.id });
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//DELETE
const deleteSingle = async (req, res) => {
  const id = req.params.id;

  try {
    await Category.deleteMany({ _id: id });
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
