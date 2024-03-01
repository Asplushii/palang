function parseInputDeclaration(line) {
  line = line.trim();

  const inputDeclarationRegex = /^(.*?): input -> "(.*?)"/;
  const match = line.match(inputDeclarationRegex);

  if (match) {
    const variable = match[1].trim();
    const prompt = match[2].trim();

    if (variable && prompt) {
      return {
        variable,
        prompt,
      };
    } else {
      throw new Error("Invalid input statement format: " + line);
    }
  } else {
    throw new Error("Invalid input statement format: " + line);
  }
}

module.exports = {
  parseInputDeclaration
};
