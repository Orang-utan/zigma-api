const { promptList } = require("../config");

const getRandomPrompt = () => {
  const idx = Math.floor(Math.random() * promptList.length);
  return new String(promptList[idx]);
};

module.exports = { getRandomPrompt };
