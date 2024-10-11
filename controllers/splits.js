const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

//getAll does not work in this case.  To see all splits for a transaction, do a Get Transaction By ID
const getSingle = async (req, res) => {
  /*
    #swagger.tags=['Splits']
  */

  const transactionId = req.params.transactionId;
  const splitId = req.params.splitId;
  const userId = ObjectId.createFromHexString(req.session.user._id);

  try {
    const transaction = await Transaction.findById(transactionId)
      // .populate({
      //   path: 'splits',
      //   populate: {
      //     path: 'category',
      //   },
      // })
      .exec();

    if (!transaction) {
      return res.status(404).json({
        error: `Transaction with id: ${transactionId} does not exist.`,
      });
    }
    if (!transaction.user.equals(userId)) {
      return res.status(404).json({
        message: `You do not have a transaction with id: ${transactionId}.`,
      });
    }

    const splitDetail = await transaction.splits.id(splitId);

    if (!splitDetail) {
      return res.status(404).json({
        error: `Split Detail with id: '${splitId}' does not exist.`,
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(splitDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addNew = async (req, res) => {
  /*
    #swagger.tags=['Splits']
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Create a new Split',
      schema: {
        categoryName: 'Transfers',
        splitAmount: 93,
        splitNote: '',
        confirmAddCategory: true
      }
    }
  */
  const transactionId = req.params.transactionId;
  const userId = ObjectId.createFromHexString(req.session.user._id);
  const { categoryName, splitAmount, splitNote, confirmAddCategory } = req.body;

  try {
    // Check if the categoryName exists in the categories collection
    let category = await Category.findOne({
      user: userId,
      categoryName: categoryName,
    });

    //If we don't have a category, create one
    if (!category) {
      // check if the user confirmed adding the new category
      if (confirmAddCategory) {
        // If the user confirmed, add the new category to the categories collection
        category = await Category.create({
          user: userId,
          categoryName: categoryName,
        });

        console.log(
          `New category '${categoryName}' added to the categories collection.`
        );
      } else {
        // Ask the user for confirmation to add the new split
        return res.status(400).json({
          error: `Category: '${categoryName}' does not exist. Would you like to add it?`,
          confirmAddCategory: true, // To signal the frontend that confirmation is needed
        });
      }
    }

    // Proceed to add the split to the transaction
    const split = {
      category: category._id,
      categoryName: categoryName,
      splitAmount: splitAmount,
      splitNote: splitNote,
    };

    const updateCriteria = { user: userId, _id: transactionId };
    const transaction = await Transaction.findOneAndUpdate(
      updateCriteria,
      { $push: { splits: split } }, // Add the split to the splits array
      { new: true }
    );

    console.log(transaction);
    if (!transaction) {
      res.status(404).json({
        message: `You do not have a transaction by that ID to add a split to.`,
      });
    } else {
      // await transaction.populate('account');
      // await transaction.populate('user');
    }

    res.status(201).json(transaction);
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const editSingle = async (req, res) => {
  /*
  #swagger.tags=["Splits"]
  #swagger.parameters['body'] = {
    in: 'body',
    description: 'Edit a Split',
    schema: {
      categoryName: 'Transfers',
      splitAmount: 93,
      splitNote: 'Car Insurance Bill Due',
      confirmAddCategory: true
    }
  }
*/
  const transactionId = req.params.transactionId;
  const userId = ObjectId.createFromHexString(req.session.user._id);
  const splitId = req.params.splitId;

  const { categoryName, splitAmount, splitNote, confirmAddCategory } = req.body;

  try {
    const transaction = await Transaction.findById(transactionId).exec();

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (!transaction.user.equals(userId)) {
      return res.status(404).json({
        message: `You do not have a transaction by that ID to edit a split for.`,
      });
    }

    // Check if the categoryName exists in the categories collection
    let category = await Category.findOne({
      user: userId,
      categoryName: categoryName,
    });

    if (!category) {
      // If the category doesn't exist, check if the user confirmed adding the new category
      if (confirmAddCategory) {
        // If the user confirmed, add the new category to the categories collection
        category = await Category.create({
          user: userId,
          categoryName: categoryName,
        });

        console.log(
          `New category '${categoryName}' added to the categories collection.`
        );
      } else {
        // Ask the user for confirmation to add the new split
        return res.status(400).json({
          error: `Category: '${categoryName}' does not exist. Would you like to add it?`,
          confirmAddCategory: true, // To signal the frontend that confirmation is needed
        });
      }
    }

    const splitDetail = transaction.splits.id(splitId);

    if (!splitDetail) {
      return res.status(404).json({ error: 'Split not found' });
    }

    splitDetail.category = category._id;
    splitDetail.splitAmount = splitAmount;
    splitDetail.splitNote = splitNote;

    await transaction.save();

    // await transaction.populate([
    //   { path: 'account' }, // Populate the account field
    //   { path: 'splits', populate: { path: 'category' } }, // Populate splits and their categories
    // ]);

    res.status(202).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//DELETE
const deleteSingle = async (req, res) => {
  /*
    #swagger.tags=['Splits']
  */
  const transactionId = req.params.transactionId;
  const userId = ObjectId.createFromHexString(req.session.user._id);
  const splitId = req.params.splitId;

  try {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction.user.equals(userId)) {
      return res.status(404).json({
        message: `The transaction you are trying to delete a split from does not exist.`,
      });
    }

    // Filter out the split you want to delete
    transaction.splits = transaction.splits.filter(
      (split) => split._id.toString() !== splitId
    );

    // Save the updated transaction
    await transaction.save();

    res.status(204).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSingle,
  addNew,
  editSingle,
  deleteSingle,
};
