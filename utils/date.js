const getBeijingTime = () => {
  var options = {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  var formatter = new Intl.DateTimeFormat([], options);
  const utcNow = new Date().getTime();

  var localTime = formatter.format(new Date(utcNow));

  return localTime;
};

const getBreakDownTime = (time) => {
  return {
    // apparently in js, month starts at 0
    monthNow: new Date(time).getMonth() + 1,
    dateNow: new Date(time).getDate(),
    hourNow: new Date(time).getHours(),
    minuteNow: new Date(time).getMinutes(),
  };
};

module.exports = {
  getBeijingTime,
  getBreakDownTime,
};
