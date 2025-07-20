-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: vietcoin
-- ------------------------------------------------------
-- Server version	8.0.21

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `token_transactions`
--

DROP TABLE IF EXISTS `token_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_transactions` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `wallet_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `type` enum('DEPOSIT','WITHDRAWAL','REWARD','REFERRAL','SYSTEM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','COMPLETED','FAILED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'COMPLETED',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reference_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `wallet_id` (`wallet_id`),
  CONSTRAINT `token_transactions_ibfk_1` FOREIGN KEY (`wallet_id`) REFERENCES `token_wallets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_transactions`
--

LOCK TABLES `token_transactions` WRITE;
/*!40000 ALTER TABLE `token_transactions` DISABLE KEYS */;
INSERT INTO `token_transactions` VALUES ('42dee488-2ec3-11f0-a0c9-00d861e5dfb2',NULL,1234,'DEPOSIT','COMPLETED','Lockup 2025-09-13T23:54:22.359Z','42da737d-2ec3-11f0-a0c9-00d861e5dfb2','2025-05-12 08:54:22'),('77777777-7777-7777-7777-777777777777','44444444-4444-4444-4444-444444444444',5000,'DEPOSIT','COMPLETED','Phase 1 Pre‑Sale Purchase','55555555-5555-5555-5555-555555555555','2025-05-05 17:34:51'),('833f46d3-886c-4c8d-af2b-3c62e4ad23f5','24b566ca-2ec7-11f0-a0c9-00d861e5dfb2',22,'WITHDRAWAL','COMPLETED','Token → Quant exchange',NULL,'2025-05-14 17:13:06'),('88888888-8888-8888-8888-888888888888','44444444-4444-4444-4444-444444444444',2000,'DEPOSIT','COMPLETED','Phase 2 Pre‑Sale Purchase','66666666-6666-6666-6666-666666666666','2025-05-05 17:34:51'),('e0779af8-b16f-457a-9fe2-1a4acfbf481a','44444444-4444-4444-4444-444444444444',1234,'DEPOSIT','COMPLETED','Token purchase from Phase 1 Pre‑Sale','64dcbf06-ee40-4044-9f96-07cf1aaf6ae3','2025-05-05 17:35:13'),('f023ac72-2ec2-11f0-a0c9-00d861e5dfb2',NULL,1234,'DEPOSIT','FAILED','Unknown column \'updated_at\' in \'field list\'','f01abb47-2ec2-11f0-a0c9-00d861e5dfb2','2025-05-12 08:52:03'),('f4aebc10-1288-466b-824d-0cab7a75352d','24b566ca-2ec7-11f0-a0c9-00d861e5dfb2',123,'WITHDRAWAL','COMPLETED','Token → Quant exchange',NULL,'2025-05-13 02:22:21'),('f8818e1a-b2c6-44be-ab50-e524b4542596','24b566ca-2ec7-11f0-a0c9-00d861e5dfb2',22,'WITHDRAWAL','COMPLETED','Token → Quant exchange',NULL,'2025-05-14 17:11:23');
/*!40000 ALTER TABLE `token_transactions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-20 23:43:08
