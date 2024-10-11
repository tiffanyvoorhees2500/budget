const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const csv = require('csvtojson');

// This is really getAllByUser
const getAll = async (req, res, next) => {
  /*
    #swagger.tags=['Transactions']
  */

  try {
    const userId = ObjectId.createFromHexString(req.session.user._id);
    const transactions = await Transaction.find({ user: userId });
    // .populate('account')
    // .populate('user');

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(transactions);
  } catch (error) {
    console.log('Error:', error.message);
    next(error);
    // res.status(500).json({ error: error.message });
  }
};

const getSingle = async (req, res, next) => {
  /*
    #swagger.tags=['Transactions']
  */

  const transactionId = req.params.transactionId;

  try {
    const transaction = await Transaction.findById(transactionId)
      // .populate('account')
      // .populate('user')
      .exec();

    // Check if transaction exists, and if the userId matches the user logged in
    if (!transaction) {
      return res.status(404).json({
        error: `Transaction with id: '${transactionId}' does not exist.`,
      });
    }

    const userId = ObjectId.createFromHexString(req.session.user._id);

    if (!transaction.user.equals(userId)) {
      return res.status(404).json({
        message: `The transaction you are looking for does not exist.`,
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(transaction);
  } catch (error) {
    console.log('Error:', error.message);
    next(error);
    // res.status(500).json({ error: error.message });
  }
};

const addNew = async (req, res, next) => {
  /*
    #swagger.tags=['Transactions']
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Create a new Transaction',
      schema: {
        accountName: 'Cash',
        transactionAmount: 5,
        transactionDate: '2024-10-03T00:00:00.000Z',
        transactionDescription: 'Isaac gave me cash'
      }
    }
  */
  const {
    accountName,
    transactionAmount,
    transactionDate,
    transactionDescription,
  } = req.body;

  const userId = ObjectId.createFromHexString(req.session.user._id);

  try {
    // Fetch the account document based on accountName
    let account = await Account.findOne({
      accountName: accountName,
      user: userId,
    });

    // If we don't have an account with the same name as the CSV file, we will create one
    if (!account) {
      account = await Account.create({
        user: userId,
        accountName: accountName,
        accountBeginningBalance: 0,
      });

      console.log(
        `New category '${accountName}' added to the categories collection.`
      );
    }

    const newTransaction = await Transaction.create({
      user: userId,
      account: account._id,
      transactionAmount: transactionAmount,
      transactionDate: transactionDate,
      transactionDescription: transactionDescription,
    });

    //Populate with the account object
    // await newTransaction.populate('account');
    // await newTransaction.populate('user');

    //if all goes well, return success status
    res.status(201).json(newTransaction);
  } catch (error) {
    console.log('Error:', error.message);
    next(error);
    // res.status(500).json({ error: error.message });
  }
};

const importFromCSV = async (req, res, next) => {
  /*
    #swagger.tags=['Transactions']
    #swagger.summary='Upload a CSV Bank Transaction File'
    #swagger.consumes=['multipart/form-data']
    #swagger.parameters=[
      {
        "name": "csvFile",
        "in": "formData",
        "description": "CSV file to upload",
        "required": true,
        "type": "file"
      }
    ]
  */

  try {
    //validate that the csvFilePath is provided
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a CSV file' });
    }

    const csvFilePath = req.file.path;
    const accountName = req.file.originalname.slice(0, -4);
    const userId = ObjectId.createFromHexString(req.session.user._id);

    // Need to make sure we are only importing where there is a value and not an empty string
    const transactionJsonArray = await csv({ delimiter: '\t' })
      .fromFile(csvFilePath)
      .then((jsonArray) => {
        return jsonArray.map((obj) =>
          Object.fromEntries(
            Object.entries(obj).filter(([key, value]) => value.trim() !== '')
          )
        );
      });

    // Fetch the account document based on accountName
    let account = await Account.findOne({
      accountName: accountName,
      user: userId,
    });

    // If we don't have an account with the same name as the CSV file, we will create one
    if (!account) {
      account = await Account.create({
        user: userId,
        accountName: accountName,
        accountBeginningBalance: 0,
      });
    }

    // Make sure we have the required fields for a transaction document.
    // Also Amount needs to be a number, not a string
    const bulk = await Promise.all(
      transactionJsonArray.map(async (transaction) => {
        // Parse and set the transaction amount and date
        transaction['transactionAmount'] = parseFloat(transaction['Amount']);
        transaction['transactionDate'] = new Date(
          transaction['Effective Date']
        );
        transaction['transactionDescription'] = transaction['Description'];

        // Assign the account document to the transaction
        transaction['account'] = account._id;
        transaction['user'] = userId;

        return transaction;
      })
    );
    const bulkOperations = bulk.map((transaction) => ({
      updateOne: {
        filter: {
          'Transaction ID': transaction['Transaction ID'],
          user: userId,
        }, //Assumption that the bank CSV file provides a Transaction ID column
        update: { $set: transaction },
        upsert: true, //If the document doesn't exist, it will be inserted
      },
    }));

    const result = await Transaction.collection.bulkWrite(bulkOperations);

    //if all goes well, return created status
    res.status(201).json({
      message: 'Bulk operation successful',
      result,
    });
  } catch (error) {
    console.log('Error:', error.message);
    next(error);
    // res.status(500).json({ error: error.message });
  }
};

const editSingle = async (req, res, next) => {
  /*
    #swagger.tags=['Transactions']
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Create a new Transaction',
      schema: {
        accountName: 'Cash',
        transactionAmount: 5,
        transactionDate: '2024-10-03T00:00:00.000Z',
        transactionDescription: 'Alex gave me cash'
      }
    }
    #swagger.description = 'Change Isaac gave me cash to Alex gave me cash'
  */
  const transactionId = req.params.transactionId;
  const userId = ObjectId.createFromHexString(req.session.user._id);

  const {
    accountName,
    transactionAmount,
    transactionDate,
    transactionDescription,
  } = req.body;

  try {
    // Fetch the account document based on accountName
    let account = await Account.findOne({
      user: userId,
      accountName: accountName,
    });

    // If we don't have an account with the same name as the CSV file, we will create one
    if (!account) {
      account = await Account.create({
        user: userId,
        accountName: accountName,
        accountBeginningBalance: 0,
      });
    }

    const updateCriteria = { user: userId, _id: transactionId };
    const updatedTransaction = await Transaction.findOneAndUpdate(
      updateCriteria,
      {
        $set: {
          account: account._id,
          transactionAmount: transactionAmount,
          transactionDate: transactionDate,
          transactionDescription: transactionDescription,
        },
      },
      { new: true } // Return the updated document
    );

    if (updatedTransaction) {
      // await updatedTransaction.populate('account');
      // await updatedTransaction.populate('user');
    } else {
      return res
        .status(404)
        .json({ message: 'This transaction could not be updated.' });
    }

    //if all goes well, return accepted status
    res.status(202).json(updatedTransaction);
  } catch (error) {
    console.log('Error:', error.message);
    next(error);
    // res.status(500).json({ error: error.message });
  }
};

//DELETE
const deleteSingle = async (req, res, next) => {
  /*
    #swagger.tags=['Transactions']
  */
  const transactionId = req.params.transactionId;

  const userId = ObjectId.createFromHexString(req.session.user._id);

  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      user: userId,
    });

    console.log(transaction);
    if (!transaction) {
      return res.status(404).json({
        message: `You are not authorized to delete that transaction.`,
      });
    }

    res.status(204).send();
  } catch (error) {
    console.log('Error:', error.message);
    next(error);
    // res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAll,
  getSingle,
  addNew,
  importFromCSV,
  editSingle,
  deleteSingle,
};
