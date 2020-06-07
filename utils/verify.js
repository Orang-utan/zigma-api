// valid school list
const validEmailList = ["yale.edu", "upenn.edu"];

const validateEmailDomain = (email) => {
  for (i = 0; i < validEmailList.length; i++) {
    const idx = email.indexOf(validEmailList[i]);
    if (idx > -1) {
      return true;
    }
  }

  return false;
};

module.exports = {
  validateEmailDomain,
};
