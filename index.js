require("dotenv").config();
const TronWeb = require("tronweb");

// 1. TronWeb 인스턴스 생성 (API 키 포함)
const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY }
});

// 2. 새 지갑 생성 함수
async function createWallet() {
  const account = await tronWeb.createAccount();
  console.log("📦 Address:", account.address.base58);
  console.log("🔐 Private Key:", account.privateKey);
}

// 3. USDT 잔액 확인
const usdtContract = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj";

async function getUSDTBalance(address) {
  const contract = await tronWeb.contract().at(usdtContract);
  const balance = await contract.methods.balanceOf(address).call();
  console.log("💰 USDT Balance:", balance / 1e6);
}

// 4. USDT 전송
async function sendUSDT(fromPrivateKey, toAddress, amount) {
  const tron = new TronWeb({
    fullHost: "https://api.trongrid.io",
    privateKey: fromPrivateKey,
    headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY }
  });

  const contract = await tron.contract().at(usdtContract);
  const tx = await contract.methods.transfer(toAddress, amount * 1e6).send();
  console.log("✅ TX Hash:", tx);
}

// 🧪 실행 예시 (주석 처리된 부분을 원하는 작업에 맞게 사용)
createWallet();
// getUSDTBalance("YOUR_WALLET_ADDRESS");
// sendUSDT("YOUR_PRIVATE_KEY", "RECEIVER_ADDRESS", 10); // 10 USDT 보내기
