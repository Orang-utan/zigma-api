const { get } = require("mongoose");

const promptList = [
  "What do you think about the weather?",
  "What's your favorite food?",
];

const getRandomPrompt = () => {
  const idx = Math.floor(Math.random() * promptList.length);
  return new String(promptList[idx]);
};

module.exports = { getRandomPrompt };
