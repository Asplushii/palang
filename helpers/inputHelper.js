const readlineSync = require('readline-sync');

function promptUser(question) {
  const answer = readlineSync.question(question);
  return answer;
}

module.exports = {
  promptUser
};
