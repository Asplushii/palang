function print(...values) {
  process.stdout.write(values.join(' ') + "\n");
}

module.exports = {
  print
};
