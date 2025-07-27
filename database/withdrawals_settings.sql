-- 출금 설정 테이블 생성
CREATE TABLE IF NOT EXISTS `withdrawals_settings` (
  `level` tinyint NOT NULL PRIMARY KEY COMMENT 'VIP 레벨 (1-10)',
  `min_amount` decimal(20,8) NOT NULL DEFAULT 0.00000000 COMMENT '최소 출금 금액',
  `daily_max_amount` decimal(20,8) NOT NULL DEFAULT 0.00000000 COMMENT '일일 최대 출금 금액',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='VIP 등급별 출금 설정';

-- 기본 데이터 삽입 (VIP 레벨 1-5)
INSERT INTO `withdrawals_settings` (`level`, `min_amount`, `daily_max_amount`) VALUES
(1, 50.00000000, 1000.00000000),
(2, 50.00000000, 2000.00000000),
(3, 50.00000000, 5000.00000000),
(4, 50.00000000, 10000.00000000),
(5, 50.00000000, 20000.00000000)
ON DUPLICATE KEY UPDATE
  `min_amount` = VALUES(`min_amount`),
  `daily_max_amount` = VALUES(`daily_max_amount`),
  `updated_at` = CURRENT_TIMESTAMP; 