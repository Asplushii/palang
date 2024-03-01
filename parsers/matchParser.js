function parseMatchStatement(line) {
  const [, variable] = line.split(" ");
  return {
    variable: variable.replace(':', ''),
  };
}

module.exports = { parseMatchStatement };
