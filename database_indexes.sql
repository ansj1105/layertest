-- Quant Trade 중복 방지를 위한 인덱스들

-- 1. 사용자별 최근 거래 조회를 위한 인덱스
CREATE INDEX idx_quant_trades_user_created 
ON quant_trades (user_id, created_at);

-- 2. 일일 거래 수 조회를 위한 인덱스
CREATE INDEX idx_quant_trades_user_date 
ON quant_trades (user_id, DATE(created_at));

-- 3. 지갑 잔액 업데이트를 위한 인덱스
CREATE INDEX idx_wallets_user_id 
ON wallets (user_id);

-- 4. 사용자 수익 요약 업데이트를 위한 인덱스
CREATE INDEX idx_user_profit_summary_user_id 
ON user_profit_summary (user_id);

-- 5. 추천 관계 조회를 위한 인덱스
CREATE INDEX idx_referral_relations_referred 
ON referral_relations (referred_id, status, level);

-- 6. VIP 레벨 조회를 위한 인덱스
CREATE INDEX idx_vip_levels_level 
ON vip_levels (level);

-- 7. 수익 기록을 위한 인덱스
CREATE INDEX idx_quant_profits_user_trade 
ON quant_profits (user_id, trade_id, type);

-- 8. 로그 기록을 위한 인덱스
CREATE INDEX idx_quant_logs_user_created 
ON quant_logs (user_id, created_at); 