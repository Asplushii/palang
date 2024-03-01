const printHelper = require('./printHelper');
const inputHelper = require('./inputHelper');
const errorHelper = require('./errorHelper');
module.exports = {
  ...printHelper,
  ...inputHelper,
  ...errorHelper
};