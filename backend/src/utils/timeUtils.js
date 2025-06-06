const getISTTime = (date) => {
  return new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
};

const formatISTDate = (date) => {
  const istDate = getISTTime(date);
  return istDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const getExpiryTime = (creationDate) => {
  const istCreationDate = getISTTime(creationDate);
  return new Date(istCreationDate.getTime() + (12 * 60 * 60 * 1000));
};

module.exports = {
  getISTTime,
  formatISTDate,
  getExpiryTime
};
