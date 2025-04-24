// 📁 src/utils/tron.js
const TronWeb = require("tronweb");

function getTronWeb(privateKey = null) {
  const address = process.env.TRON_DEFAULT_ADDRESS;
  const options = {
    fullHost: "https://api.trongrid.io",
    headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY },
    address,
  };
  if (privateKey) options.privateKey = privateKey;
  return new TronWeb(options);
}

module.exports = { getTronWeb };