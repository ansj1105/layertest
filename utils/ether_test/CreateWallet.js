const { Wallet } = require('ethers');
const mysql = require('mysql2/promise');

// DB 연결 정보
const dbConfig = {
  host: 'localhost',
  user: 'vietcoin',
  password: 'vietcoin1234!',
  database: 'vietcoin'
};

async function createWallet() {
  const wallet = Wallet.createRandom();

  console.log('🔐 BNB Wallet 생성 완료');
  console.log('주소 (address):', wallet.address);
  console.log('공개키 (public key):', wallet.publicKey);
  console.log('개인키 (private key):', wallet.privateKey);
  console.log('니모닉 (mnemonic):', wallet.mnemonic.phrase);

  // DB에 기록
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute(
    `INSERT INTO bnb_log (address, public_key, private_key, mnemonic) VALUES (?, ?, ?, ?)`,
    [wallet.address, wallet.publicKey, wallet.privateKey, wallet.mnemonic.phrase]
  );
  await conn.end();
  console.log('✅ DB 기록 완료');
}

createWallet();