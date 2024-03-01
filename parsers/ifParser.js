function preprocessExpression(expression) {
  return expression
    .replace(/(\w+)\s*<=\s*(\w+)/g, 'smallerEq(\$1, \$2)')
    .replace(/(\w+)\s*>=\s*(\w+)/g, 'biggerEq(\$1, \$2)')
    .replace(/\|\|/g, 'or');
}

function parseIfStatement(line) {
  const startIndex = line.startsWith("if") ? 3 : 5;
  const condition = line.slice(startIndex).trim();
  const cleanedCondition = preprocessExpression(condition.replace(':', '').replace('=', '=='));

  if (!cleanedCondition) {
    throw new Error("Invalid if statement: missing condition");
  }

  return {
    condition: cleanedCondition
  };
}


module.exports = {
  parseIfStatement
};
