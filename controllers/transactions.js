const Transaction = require('../models/transaction');
const Account = require('../models/account');

const path = require('path');
const csv = require('csvtojson');

const getAll = async (req, res) => {
  /*
    #swagger.tags=['Transactions']
  */
  try {
    const transactions = await Transaction.find().populate('account');

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSingle = async (req, res) => {
  /*
    #swagger.tags=['Transactions']
  */

  const transactionId = req.params.transactionId;

  try {
    const transaction = await Transaction.findById(transactionId)
      .populate('account')
      .exec();

    if (!transaction) {
      return res.status(404).json({
        error: `Transaction with id: '${transactionId}' does not exist.`,
      });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addNew = async (req, res) => {
  /*
    #swagger.tags=['Transactions']
    #swagger.description = '
      {
        "accountName": "Cash",
        "transactionAmount": 5,
        "transactionDate": "2024-10-03T00:00:00.000Z",
        "transactionDescription": "Isaac gave me cash"
      }
    '
  */
  const {
    accountName,
    transactionAmount,
    transactionDate,
    transactionDescription,
  } = req.body;

  try {
    // Fetch the account document based on accountName
    let account = await Account.findOne({
      accountName: accountName,
    });

    // If we don't have an account with the same name as the CSV file, we will create one
    if (!account) {
      account = await Account.create({
        accountName: accountName,
        accountBeginningBalance: 0,
      });

      console.log(
        `New category '${accountName}' added to the accounts collection.`
      );
    }

    const newTransaction = await Transaction.create({
      account: account._id,
      transactionAmount: transactionAmount,
      transactionDate: transactionDate,
      transactionDescription: transactionDescription,
    });

    //Populate with the account object
    await newTransaction.populate('account');

    //if all goes well, return success status
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const importFromCSV = async (req, res) => {
  /*
    #swagger.tags=['Transactions']
    #swagger.description='Testing file Path: C:\\\\Users\\\\Admin\\\\OneDrive - BYU-Idaho\\\\Backend Classes\\\\CSE341-Web Services- Assignments\\\\CSE341_Week03-04_Project_Budget\\\\files\\\\CHECKING.csv'
  */

  try {
    //validate that the csvFilePath is provided
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a CSV file' });
    }

    const csvFilePath = req.file.path;
    const accountName = path.parse(csvFilePath).name;

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
    });

    // If we don't have an account with the same name as the CSV file, we will create one
    if (!account) {
      account = await Account.create({
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

        return transaction;
      })
    );
    const bulkOperations = bulk.map((transaction) => ({
      updateOne: {
        filter: { 'Transaction ID': transaction['Transaction ID'] }, //Assumption that the bank CSV file provides a Transaction ID column
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
    res.status(500).json({ error: error.message });
  }
};

const editSingle = async (req, res) => {
  /*
    #swagger.tags=['Transactions']
    #swagger.description = '
      {
        "accountName": "Cash",
        "transactionAmount": 5,
        "transactionDate": "2024-10-03T00:00:00.000Z",
        "transactionDescription": "Alex gave me cash"
      }
    '
  */
  const transactionId = req.params.transactionId;
  const {
    accountName,
    transactionAmount,
    transactionDate,
    transactionDescription,
  } = req.body;

  try {
    // Fetch the account document based on accountName
    let account = await Account.findOne({
      accountName: accountName,
    });

    // If we don't have an account with the same name as the CSV file, we will create one
    if (!account) {
      account = await Account.create({
        accountName: accountName,
        accountBeginningBalance: 0,
      });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        account: account._id,
        transactionAmount: transactionAmount,
        transactionDate: transactionDate,
        transactionDescription: transactionDescription,
      },
      { new: true } // Return the updated document
    );

    await updatedTransaction.populate('account');

    //if all goes well, return accepted status
    res.status(202).json(updatedTransaction);
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
  addNew,
  importFromCSV,
  editSingle,
  deleteSingle,
};
