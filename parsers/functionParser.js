function parseFunctionDeclaration(line) {
  const [functionName] = line.split(":");
  return {
    functionName: functionName.trim(),
  };
}

module.exports = {
  parseFunctionDeclaration
};