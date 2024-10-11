const routes = require('express').Router();
const multer = require('multer');
const transactionController = require('../controllers/transactions.js');
const splitsController = require('../controllers/splits.js');
const utilities = require('../utilities/');
const transactionRules = require('../utilities/transaction-validation.js');
const splitRules = require('../utilities/splits-validation.js');
const { ensureAuth } = require('../utilities/auth.js');

// GET Transaction Route
routes.get(
  '/',
  ensureAuth,
  transactionController.getAll,
  utilities.handleErrors
);
routes.get(
  '/:transactionId',
  ensureAuth,
  transactionController.getSingle,
  utilities.handleErrors
);

routes.post(
  '/',
  ensureAuth,
  transactionRules.transactionValidationRules(),
  utilities.validate,
  transactionController.addNew,
  utilities.handleErrors
);

const storage = multer.diskStorage({
  // notice you are calling the multer.diskStorage() method here, not multer()
  path: function (req, file, cb) {
    cb(null, 'files/');
  },
  originalName: function (req, file, cb) {
    cb(null, file.originalname + '-' + Date.now());
  },
});
const upload = multer({ storage }); //provide the return value from

routes.post(
  '/import',
  ensureAuth,
  upload.single('csvFile'),
  transactionController.importFromCSV,
  utilities.handleErrors
);

// UPDATE Transaction Route
routes.put(
  '/:transactionId',
  ensureAuth,
  transactionRules.transactionValidationRules(),
  utilities.validate,
  transactionController.editSingle,
  utilities.handleErrors
);

// DELETE Transaction Route
routes.delete(
  '/:transactionId',
  ensureAuth,
  transactionController.deleteSingle,
  utilities.handleErrors
);

// SPLIT ROUTES
// GET SINGLE nested split inside transaction Route
routes.get(
  '/:transactionId/:splitId',
  ensureAuth,
  splitsController.getSingle,
  utilities.handleErrors
);

// CREATE new split nested inside transaction
routes.post(
  '/:transactionId/',
  ensureAuth,
  splitRules.splitsValidationRules(),
  utilities.validate,
  splitsController.addNew,
  utilities.handleErrors
);

// UPDATE nested split inside transaction Route
routes.put(
  '/:transactionId/:splitId',
  ensureAuth,
  splitRules.splitsValidationRules(),
  utilities.validate,
  splitsController.editSingle,
  utilities.handleErrors
);

// DELETE nested split inside transaction Route
routes.delete(
  '/:transactionId/:splitId',
  ensureAuth,
  splitsController.deleteSingle,
  utilities.handleErrors
);

module.exports = routes;
