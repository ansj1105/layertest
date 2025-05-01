// 📁 utils/tron.js
require("dotenv").config();
const TronWeb = require("tronweb");

const USDT_CONTRACT = process.env.USDT_CONTRACT || "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

function getTronWeb(privateKey = null) {
  const fullHost = process.env.TRON_FULL_HOST || "https://api.trongrid.io";
  const headers  = { "TRON-PRO-API-KEY": process.env.TRON_API_KEY };
  const options  = { fullHost, headers };
  if (privateKey) options.privateKey = privateKey;
  return new TronWeb(options);
}

module.exports = { getTronWeb, USDT_CONTRACT };
