// resend-tx.js
// 간단한 스크립트로 저장된 rawTx JSON을 가져와 재브로드캐스트합니다.
// 사용법: node resend-tx.js rawTx.json

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import TronWeb from 'tronweb';
import dotenv from 'dotenv';

dotenv.config();

// __dirname 정의 (ESM 환경)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resendTransaction(rawTxFile) {
  // 1) rawTx JSON 불러오기
  const filePath = path.isAbsolute(rawTxFile)
    ? rawTxFile
    : path.join(__dirname, rawTxFile);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // 2) TronWeb 인스턴스 생성
  const tronWeb = new TronWeb({
    fullNode:     process.env.TRON_FULL_NODE     || 'http://localhost:8090',
    solidityNode: process.env.TRON_SOLIDITY_NODE || 'http://localhost:8091',
    eventServer:  process.env.TRON_EVENT_SERVER  || 'http://localhost:8092',
    headers:      { 'TRON-PRO-API-KEY': process.env.TRON_API_KEY }
  });

  // 3) 재브로드캐스트
  console.log('🔄 Re-broadcasting transaction...');
  const result = await tronWeb.trx.sendRawTransaction(raw);
  console.log('📋 Broadcast result:', result);

  if (result.result === true) {
    console.log('✅ Transaction successfully rebroadcasted.');
    console.log('   New txHash:', result.txid);
  } else {
    console.error('❌ Broadcast failed:', result);
  }
}

// CLI 인자 처리
const [, , rawTxPath] = process.argv;
if (!rawTxPath) {
  console.error('Usage: node resend-tx.js <rawTx.json>');
  process.exit(1);
}

resendTransaction(rawTxPath).catch(err => {
  console.error('🚨 Error in resending transaction:', err);
  process.exit(1);
});
