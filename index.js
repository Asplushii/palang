const readlineSync = require("readline-sync");
const fs = require("fs");
const parsers = require("./parsers");
const variableParser = require("./parsers/variableParser")
const {
  handleError
} = require("./helpers");

const math = require('mathjs');
const variables = {};
conditionResult = false;
let matchVariable = null;
let matchCases = {};
let blockStack = [];





function evaluateExpression(expression) {
  return math.evaluate(expression, variables);
}

function executeCodeFromFile(filename) {
  try {
    fs.readFile(filename, 'utf-8', (err, fileContent) => {
      if (err) {
        console.error(err.message);
        process.exit(1);
      }
      const lines = fileContent.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim()) {
          currentLine = i;
          executeLine(line);
        }
      }
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}


function executeLine(line) {
  line = line.split(";")[0];

  try {
    const trimmedLine = line.trim();

    if (matchVariable) {
      if (trimmedLine === "end") {
        const matchVariableStr = variables[matchVariable]?.toString();
        if (matchVariableStr !== undefined && matchCases[matchVariableStr]) {
          console.log(matchCases[matchVariableStr]);
        } else if (matchCases.default) {
          console.log(matchCases.default);
        }
        matchVariable = null;
        matchCases = {};
      } else {
        const [caseValueRaw, printStatementRaw] = trimmedLine.split(":");
        const caseValue = caseValueRaw.trim();
        const printStatement = printStatementRaw.split("->").map(str => str.trim());
        if (caseValue === "_") {
          matchCases.default = printStatement[1];
        } else {
          const [type, expression] = printStatement;
          if (type === "print") {
            const result = math.evaluate(expression, variables);
            matchCases[caseValue] = result;
          } else {
            matchCases[caseValue] = expression;
          }
        }
      }
    }

    var variable;
    var value;

    if (variables[variable] === value) {
      conditionResult = true;
    } else {
      conditionResult = false;
    }

    if (trimmedLine.startsWith("if") || trimmedLine.startsWith("elif")) {
      const {
        condition
      } = parsers.parseIfStatement(trimmedLine);
      let result;
      try {
        result = math.evaluate(condition, variables);
      } catch (error) {
        console.error(`An error occurred while evaluating the condition: ${error.message}`);
        return;
      }

      blockStack.push(result);
      return;
    }


    if (trimmedLine.startsWith("else")) {
      blockStack.push(!blockStack.pop());
      return;
    }

    if (trimmedLine === "end") {
      blockStack.pop();
      return;
    }
    if (blockStack[blockStack.length - 1] === false) {
      return;
    }

    function getRandomItemFromArray(array) {
      const randomIndex = Math.floor(Math.random() * array.length);
      return array[randomIndex];
    }

    if (trimmedLine.startsWith("match")) {
      const {
        variable
      } = parsers.parseMatchStatement(trimmedLine);
      matchVariable = variable;
    } else if (trimmedLine.startsWith("print")) {
      const printContent = trimmedLine.substring(6).trim();

      if (printContent === '') {
        console.log('');
      } else {
        const printValues = printContent.split(',').map((value) => value.trim());

        const resolvedValues = printValues.map((value) => {
          if (/^"(.*)"$/g.test(value)) {
            return value.substring(1, value.length - 1);
          } else if (value in variables) {
            return variables[value];
          } else {
            try {
              return math.evaluate(value, variables);
            } catch (error) {
              console.error('Variable not found:', value);
              return null;
            }
          }
        });

        console.log(resolvedValues.join(''));
      }
    }


    if (trimmedLine.includes("->")) {
      const {
        name,
        type,
        value
      } = variableParser.parseVariableDeclaration(trimmedLine, variables);
      switch (type) {
        case "int": {
          variables[name] = evaluateExpression(value);
          break;
        }
        case "sqrt": {
          const [expression, decimalPlaces] = value.split(',');
          const valueToSquareRoot = evaluateExpression(expression);
          if (valueToSquareRoot < 0) {
            console.error("Can't calculate the square root of a negative number: " + expression);
          } else {
            const sqrtValue = Math.sqrt(valueToSquareRoot);
            variables[name] = sqrtValue.toFixed(parseInt(decimalPlaces));
          }
          break;
        }

        case "input": {
          const endIndex = value.lastIndexOf('"');
          const inputValue = readlineSync.question(value.substring(1, endIndex) + " ");
          const isMathExpression = inputValue.match(/[0-9+\-*/^() ]+/);

          if (isMathExpression) {
            try {
              const result = math.evaluate(isMathExpression[0]);
              variables[name] = result;
            } catch (error) {
              console.error("Invalid math expression:", error);
            }
          } else {
            const words = inputValue.split(" ");
            words[0] = words[0].replace(/"/g, "");
            variables[name] = words.join("");
          }
          break;
        }

        case "let":
          variables[name] = value.replace(/['"]+/g, "");
          break;
        case "list": {
          try {
            if (value.includes('[') && value.includes(']')) {
              const arrayPart = value.substring(value.indexOf('['), value.lastIndexOf(']') + 1);
              listValues = JSON.parse(arrayPart);
            } else {
              listValues = value.join(', ').map(str => str.trim());
            }
          } catch (error) {
            listValues = value.join(', ').map(str => str.trim());
          }
          variables[name] = listValues;

          break;
        }

        case "rand": {
          let arrayVariable;
          if (value.startsWith('[') && value.endsWith(']')) {
            arrayVariable = JSON.parse(value);
          } else {
            const arrayName = value;
            arrayVariable = variables[arrayName];
          }

          if (Array.isArray(arrayVariable)) {
            variables[name] = getRandomItemFromArray(arrayVariable);
          } else {
            console.error("Variable is not an array: " + arrayName);
          }
          break;
        }




          function generateRange(start, end, step) {
            const length = Math.floor((end - start) / step) + 1;
            return Array.from({
              length
            }, (_, i) => start + i * step);
          }

        case "range": {
          let rangeValues = value.split(',').map(str => Number(str.trim()));

          if (rangeValues.length === 2 && !Number.isNaN(rangeValues[0]) && !Number.isNaN(rangeValues[1])) {
            let [start, end] = rangeValues;
            const step = start <= end ? 1 : -1;
            variables[name] = generateRange(start, end, step);
          } else if (rangeValues.length === 3 && !Number.isNaN(rangeValues[0]) && !Number.isNaN(rangeValues[1]) && !Number.isNaN(rangeValues[2])) {
            let [start, end, step] = rangeValues;
            step = start <= end ? step : -step;
            variables[name] = generateRange(start, end, step);
          } else {
            variables[name] = rangeValues;
          }
          break;
        }
        case "find": {
          const [substring, stringName] = value.split(',');
          const string = variables[stringName.trim()];
          const index = string.indexOf(substring.trim());
          if (index !== -1) {
            variables[name] = index;
          } else {
            console.log("Substring not found in string: " + substring);
          }
          break;
        }
        case "incl": {
          const [substring, stringName] = value.split(',');
          const string = variables[stringName.trim()];
          const isSubstringIncluded = string.includes(substring.trim());
          variables[name] = isSubstringIncluded;
          break;
        }
        case "replace": {
          const [stringName, charToReplace, newChar] = value.split(',');
          const string = variables[stringName.trim()];
          const updatedString = string.replace(new RegExp(charToReplace.trim(), 'g'), newChar.trim());
          variables[name] = updatedString;
          break;
        }

        case "length": {
          const variable = variables[value];
          if (Array.isArray(variable)) {
            variables[name] = variable.length;
          } else {
            console.log("Variable is not an array: " + value);
          }
          break;
        }
        case "reverse": {
          const variable = variables[value];
          if (Array.isArray(variable)) {
            variables[name] = variable.slice().reverse();
          } else {
            console.log("Variable is not an array: " + value);
          }
          break;
        }
        case "join": {
          const [arrayName, joinValue] = value.split(",");
          const arrayVariable = variables[arrayName];
          if (Array.isArray(arrayVariable)) {
            variables[name] = arrayVariable.map((element) => element + joinValue);
          } else {
            console.log("Variable is not an array: " + arrayName);
          }
          break;
        }
        case "size": {
          const [variableName, replacementCharacter] = value.split(',');
          const variable = variables[variableName.trim()];

          if (typeof variable === 'string') {
            if (replacementCharacter) {
              variables[name] = variable.replace(/./g, replacementCharacter.trim());
            } else {
              variables[name] = variable.length;
            }
          } else {
            console.log("Variable is not a string: " + variableName);
          }
          break;
        }


        case "sort": {
          const [arrayName, sortOrder] = value.split(",");
          const arrayVariable = variables[arrayName];
          if (Array.isArray(arrayVariable)) {
            variables[name] = [...arrayVariable].sort((a, b) => sortOrder === 'a' ? a - b : b - a);
          } else {
            console.log("Variable is not an array: " + arrayName);
          }
          break;
        }
        case "fill": {
          const [arrayName, fillValue] = value.split(",");
          const arrayVariable = variables[arrayName];
          if (Array.isArray(arrayVariable)) {
            variables[name] = arrayVariable.fill(fillValue);
          } else {
            console.log("Variable is not an array: " + arrayName);
          }
          break;
        }
        case "pop": {
          const arrayName = value;
          const arrayVariable = variables[arrayName];
          if (Array.isArray(arrayVariable)) {
            variables[name] = [...arrayVariable];
            variables[name].pop();
          } else {
            console.log("Variable is not an array: " + arrayName);
          }
          break;
        }
        case "shift": {
          const arrayName = value;
          const arrayVariable = variables[arrayName];
          if (Array.isArray(arrayVariable)) {
            variables[name] = [...arrayVariable];
            variables[name].shift();
          } else {
            console.log("Variable is not an array: " + arrayName);
          }
          break;
        }
        case "push": {
          const [arrayName, pushValue] = value.split(",");
          const arrayVariable = variables[arrayName];
          if (Array.isArray(arrayVariable)) {
            variables[name] = [...arrayVariable];
            variables[name].push(pushValue);
          } else {
            console.log("Variable is not an array: " + arrayName);
          }
          break;
        }
        case "unshift": {
          const [arrayName, unshiftValue] = value.split(",");
          const arrayVariable = variables[arrayName];
          if (Array.isArray(arrayVariable)) {
            variables[name] = [...arrayVariable];
            variables[name].unshift(unshiftValue);
          } else {
            console.log("Variable is not an array: " + arrayName);
          }
          break;
        }
      }
    } else if (trimmedLine.startsWith("let")) {
      const {
        variable,
        value
      } = parsers.parseLetStatement(trimmedLine);
      variables[variable] = value;
    } else if (trimmedLine.startsWith("func")) {
      const {
        functionName
      } = parsers.parseFunctionDeclaration(trimmedLine);
    } else if (trimmedLine.includes("->")) {
      const {
        variable
      } = parsers.parseInputDeclaration(trimmedLine);
      variables[variable] = "HardcodedinputValue";
    } else { }
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
}

const main = () => {
  const inputFileName = 'source.pa';
  if (!inputFileName) {
    handleError("Usage: node interpreter.js <input_file>");
  }
  executeCodeFromFile(inputFileName);
}

main();