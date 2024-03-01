const variableParser = require('./variableParser');
const matchParser = require('./matchParser');
const functionParser = require('./functionParser');
const inputParser = require('./inputParser');
const ifParser = require('./ifParser');
module.exports = {
  ...variableParser,
  ...functionParser,
  ...inputParser,
  ...matchParser,
  ...ifParser
};