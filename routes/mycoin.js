// 📁 scripts/check-tx.js
import { getTronWeb } from '../utils/tron.js'; // ESM 쓰시는 경우
// const { getTronWeb } = require('../utils/tron'); // CommonJS 쓰시는 경우

async function checkTx(txHash) {
  const tronWeb = getTronWeb(); // .env에 풀/솔리디티/이벤트 서버 모두 설정돼 있어야 함

  try {
    // 1) 풀노드에서 트랜잭션 기본 데이터 조회
    const tx = await tronWeb.trx.getTransaction(txHash);
    console.log('🔍 getTransaction →', tx);

    // 2) solidityNode에서 트랜잭션 실행 결과(컨펌 정보) 조회
    const info = await tronWeb.trx.getTransactionInfo(txHash);
    console.log('🔍 getTransactionInfo →', info);

    // 3) pending pool에도 있는지 확인 (풀노드 전용)
    try {
      const pending = await tronWeb.fullNode.request(
        'wallet/getpendingtransactionbyid',
        { value: txHash }
      );
      console.log('🔍 Pending pool contains:', pending.raw_data ? true : false);
    } catch (e) {
      console.log('🔍 Not in pending pool (or RPC not supported):', e.message);
    }

    // 4) confirmed balance vs pending balance 비교 (optional)
    const address = tx.raw_data.contract[0].parameter.value.owner_address;
    const base58 = tronWeb.address.fromHex(address);
    const confirmed = await tronWeb.solidityNode.request(
      'walletsolidity/getaccount',
      { address }
    );
    console.log(`💰 Confirmed TRX balance for ${base58}:`, tronWeb.fromSun(confirmed.balance || 0));

    const pendingBal = await tronWeb.trx.getBalance(base58);
    console.log(`💰 Pending TRX balance for ${base58}:`, tronWeb.fromSun(pendingBal));

  } catch (err) {
    console.error('❌ checkTx error:', err);
  }
}

// txHash는 실행 시 인자로 넘겨줄 수도 있고, 직접 코드에 박아도 됩니다.
const txHash = process.argv[2] || 'd9dd5b0ac1a8b6b4a5e684838ef9752b22ecd2f979d978aea87624dcc4d9337a';
checkTx(txHash);
