const { body } = require('express-validator');

const splitsValidationRules = () => {
  return [
    body('categoryName').trim().notEmpty().isString(),
    body('splitAmount').isNumeric(),
    body('splitNote').isString(),
    body('confirmAddCategory').isBoolean(),
  ];
};


module.exports = {
  splitsValidationRules,
};
