// configuration variables
const TESTING = true;
const PROFILE_IMAGE_CONTAINER_NAME = "images";
const STORAGE_BASE_URL = "https://zigma.blob.core.windows.net";

const promptList = [
  "What do you think about the weather?",
  "What's your favorite food?",
];
const validEmailList = ["yale.edu", "upenn.edu"];

module.exports = {
  TESTING,
  PROFILE_IMAGE_CONTAINER_NAME,
  STORAGE_BASE_URL,
  promptList,
  validEmailList,
};
