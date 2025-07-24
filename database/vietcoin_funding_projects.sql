-- MySQL dump 10.13  Distrib 8.0.42, for macos15 (arm64)
--
-- Host: localhost    Database: vietcoin
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.24.04.2

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
-- Table structure for table `funding_projects`
--

DROP TABLE IF EXISTS `funding_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `funding_projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `min_amount` decimal(18,6) DEFAULT NULL,
  `max_amount` decimal(18,6) DEFAULT NULL,
  `target_amount` decimal(18,6) NOT NULL,
  `daily_rate` decimal(5,2) DEFAULT NULL,
  `cycle_days` int DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `status` enum('open','closed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `min_participants` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `current_amount` decimal(18,6) DEFAULT '0.000000',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funding_projects`
--

LOCK TABLES `funding_projects` WRITE;
/*!40000 ALTER TABLE `funding_projects` DISABLE KEYS */;
INSERT INTO `funding_projects` VALUES (11,'LegacyTrust 700D','\nTarget Investors:\nSafety-oriented investors such as pension funds, foundations, and institutions with long-term investment horizons.\nRevenue Model:\nSecuritized investments based on long-term loans and tangible assets (e.g., auto-secured loans, mortgages).',1000.000000,1000000.000000,10000000000.000000,0.15,700,'2025-08-01 00:00:00','2026-12-31 00:00:00','open',10000000,'2025-05-09 10:56:41',4444.000000,'2025-07-21 05:00:58'),(12,'InfinityBond 500D','\nTarget Investors:\nCorporate investors and institutional fund managers.\nRevenue Model:\nA large-scale liquidity pool is established to capture interest margins from the overall system-wide capital flow, with profits distributed accordingly.',10000.000000,800000.000000,1000000000.000000,0.30,500,'2025-08-01 00:00:00','2026-12-21 00:00:00','open',10000000,'2025-05-14 17:15:22',3234.000000,'2025-07-21 05:01:23'),(15,'CoreSecure 210D','\nTarget Investors:\nHigh-net-worth individuals who prefer stable and tax-efficient investment products.\nRevenue Model:\nReturns are generated and distributed based on institution-guaranteed loans or asset-backed lending, ensuring income stability.',7000.000000,500000.000000,100000000.000000,0.50,210,'2025-08-01 00:00:00','2026-07-21 00:00:00','open',10000000,'2025-07-21 00:52:11',0.000000,'2025-07-21 05:01:41'),(16,'MomentumPool 180D','\nTarget Investors:\nCorporate or institutional investors managing diversified portfolios.\nRevenue Model:\nInvestments are diversified across thousands of loan assets and linked to an automated distribution system for seamless returns.',5000.000000,250000.000000,100000000.000000,0.65,179,'2025-08-01 00:00:00','2026-06-21 00:00:00','open',10000000,'2025-07-21 01:49:45',0.000000,'2025-07-21 05:02:02'),(17,'TrustFlow 150D','\nTarget Investors:\nInvestors seeking higher returns compared to traditional bank deposits.\nRevenue Model:\nFunds are managed based on a pool of borrowers pre-approved by Upstart, ensuring stable repayment flows.',3000.000000,150000.000000,100000000.000000,0.00,150,'2025-08-01 00:00:00','2026-04-30 00:00:00','open',10000000,'2025-07-21 01:51:26',0.000000,'2025-07-21 05:02:22'),(18,'SmartBalance 120D','\nTarget Investors:\nInvestors seeking steady and continuous cash flow.\nRevenue Model:\nFunds are automatically allocated to low-risk credit microloans → returns are generated from repayments and distributed as dividends.',2000.000000,100000.000000,100000000.000000,0.90,120,'2025-08-01 00:00:00','2026-03-31 00:00:00','open',10000000,'2025-07-21 01:51:30',0.000000,'2025-07-21 05:02:35'),(19,'PartnerGrow 90D','\nTarget Investors:\nInstitutional partners and VIP individual investors seeking medium- to short-term deposit-based returns.\nRevenue Model:\nFunds are deposited into a loan-matching standby pool → the system actively manages asset circulation → a portion of the generated profits is distributed to investors.',1000.000000,60000.000000,100000000.000000,1.10,90,'2025-08-01 00:00:00','2026-02-28 00:00:00','open',100000000,'2025-07-21 01:51:32',0.000000,'2025-07-21 05:02:51'),(20,'FlexCredit 30D','\nTarget Investors:\nMid-level investors seeking short-term, diversified returns using a portion of their fixed assets.\nRevenue Model:\nLoans are issued to the top 30% of individual borrowers with high credit ratings, matched by Upstart AI.\nReturns are generated and distributed from the principal and interest repayments.',1000.000000,25000.000000,100000000000.000000,1.20,30,'2025-08-01 00:00:00','2026-01-21 00:00:00','open',10000000,'2025-07-21 01:51:35',0.000000,'2025-07-21 05:03:08'),(21,'AutoYield 7D','\nTarget Investors: New users seeking short-term returns\nRevenue Structure:\nProviding liquidity to Upstart’s auto finance lease asset pool → Generating interest through lease income distribution → Principal + interest paid after short-term holding\n\nKey Features:\n7-day lock-up period, fast interest recovery',500.000000,5000.000000,100000000.000000,1.50,7,'2025-08-01 00:00:00','2026-01-31 00:00:00','open',100000000,'2025-07-21 01:51:37',0.000000,'2025-07-21 05:03:20');
/*!40000 ALTER TABLE `funding_projects` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-21 16:24:04
