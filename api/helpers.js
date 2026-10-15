// Convert string to base64url encoding natively
const base64url = (str) => {
  return Buffer.from(str).toString("base64url");
};

module.exports = { base64url };
