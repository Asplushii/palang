function handleError(errorMessage) {
  console.error(errorMessage);
  process.exit(1);
}

module.exports = {
  handleError
};