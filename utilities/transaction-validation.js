const { body } = require('express-validator');

const transactionValidationRules = () => {
  return [
    body('accountName')
      .trim()
      .escape()
      .notEmpty()
      .isString()
      .withMessage('An account name is requires'),
    body('transactionAmount').isDecimal({
      decimal_digits: '2,2',
      locale: 'en-US',
      force_decimal: true,
    }),
    body('transactionDescription')
      .trim()
      .notEmpty()
      .isString()
      .withMessage('A description is required.'),
    body('transactionDate')
      .isISO8601({ strict: true }) // Ensure strict adherence to ISO 8601 format
      .withMessage(
        'Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)'
      ),
  ];
};

module.exports = {
  transactionValidationRules,
};
