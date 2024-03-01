const parseVariableDeclaration = (line) => {
  const [fullname, ...valueParts] = line.split("->").map((item) => item.trim());
  const [name, type] = fullname.split(":").map((item) => item.trim());
  const value = valueParts.join('->').trim();

  if (!name || !type) {
    throw new Error("Invalid variable declaration format: " + line);
  }

  return {
    name,
    type,
    value,
  };
};

const parseRangeDeclaration = (line) => {
  const [name, type, value] = line.split("->").map(str => str.trim().split(" "));

  if (!name || !type || !value) {
    throw new Error("Invalid range declaration format: " + line);
  }

  return {
    name,
    type: type[0],
    value: value[0],
  };
};

module.exports = { parseVariableDeclaration, parseRangeDeclaration };
