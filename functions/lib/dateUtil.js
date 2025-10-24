const { startOfDay, endOfDay } = require("date-fns");

const getStartOfDay = (date) => {
  return startOfDay(date);
};

const getEndOfDay = (date) => {
  return endOfDay(date);
};

module.exports = {
  getStartOfDay,
  getEndOfDay,
};
