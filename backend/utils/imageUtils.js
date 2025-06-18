const isValidBase64Image = (base64String) => {
  if (!base64String || typeof base64String !== 'string') return false;
  try {
    const [header, data] = base64String.split(',');
    return header.includes('image') && !!data;
  } catch (error) {
    return false;
  }
};

module.exports = { isValidBase64Image };
