const routes = require('express').Router();
const transactionController = require('../controllers/transactions.js');
const splitsController = require('../controllers/splits.js');
const utilities = require('../utilities/');
const transactionRules = require('../utilities/transaction-validation.js');
const splitRules = require('../utilities/splits-validation.js');

// GET Transaction Route
routes.get('/', transactionController.getAll, utilities.handleErrors);
routes.get(
  '/:transactionId',
  transactionController.getSingle,
  utilities.handleErrors
);

// CREATE Transaction Route (Can be done manually or via importing CSV file)
routes.post(
  '/',
  transactionRules.transactionValidationRules(),
  utilities.validate,
  transactionController.addNew,
  utilities.handleErrors
);
routes.post('/import', transactionController.importFromCSV, utilities.handleErrors);

// UPDATE Transaction Route
routes.put(
  '/:transactionId',
  transactionRules.transactionValidationRules(),
  utilities.validate,
  transactionController.editSingle,
  utilities.handleErrors
);

// DELETE Transaction Route
routes.delete(
  '/:transactionId',
  transactionController.deleteSingle,
  utilities.handleErrors
);

// SPLIT ROUTES
// GET SINGLE nested split inside transaction Route
routes.get(
  '/:transactionId/:splitId',
  splitsController.getSingle,
  utilities.handleErrors
);

// CREATE new split nested inside transaction
routes.post(
  '/:transactionId/',
  splitRules.splitsValidationRules(),
  utilities.validate,
  splitsController.addNew,
  utilities.handleErrors
);

// UPDATE nested split inside transaction Route
routes.put(
  '/:transactionId/:splitId',
  splitRules.splitsValidationRules(),
  utilities.validate,
  splitsController.editSingle,
  utilities.handleErrors
);

// DELETE nested split inside transaction Route
routes.delete(
  '/:transactionId/:splitId',
  splitsController.deleteSingle,
  utilities.handleErrors
);

module.exports = routes;