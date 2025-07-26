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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funding_projects`
--

LOCK TABLES `funding_projects` WRITE;
/*!40000 ALTER TABLE `funding_projects` DISABLE KEYS */;
INSERT INTO `funding_projects` VALUES (15,'InfinityTier 365D','\nProfit Structure: Investments are integrated and managed within the liquidity pool of the entire Dave ecosystem.\nFunds automatically receive a proportional share of interest margins generated across various services, including ExtraCash™, Spending accounts, personal loans, and partner service revenues.\nSince capital is distributed across the platform’s entire financial flow, investors effectively receive a share of overall platform profits.',7500.000000,550000.000000,100000001.000000,0.50,365,'2025-07-31 00:00:00','2026-07-20 00:00:00','open',1,'2025-07-21 00:52:11',0.000000,'2025-07-27 05:11:22'),(16,'TrustVault 180D','\nProfit Structure: Investments are directly allocated to asset-backed loans secured by Dave’s physical assets, such as vehicles and real estate lease holdings.\nThese assets undergo internal valuation and are securitized, with repayment returns distributed on a quarterly basis.\nEarly termination is not allowed, making this product suitable for investors seeking long-term, stable returns.',5500.000000,260000.000000,100000000.000000,0.65,180,'2025-07-31 00:00:00','2026-06-20 00:00:00','open',1,'2025-07-21 01:49:45',0.000000,'2025-07-27 05:08:29'),(18,'PrimeBond 90D','\nProfit Structure: Investments are managed through loan products guaranteed or collateralized by financial institutions or insurance partners affiliated with Dave.\nFunds are linked exclusively to these secured or institution-backed products, offering a fixed projected return and ensuring stable earnings.\nWith Dave’s risk coverage model in place, the risk of default is virtually zero.',3500.000000,160000.000000,99999999.000000,0.75,90,'2025-07-31 00:00:00','2026-03-30 00:00:00','open',1,'2025-07-21 01:51:30',0.000000,'2025-07-27 05:06:06'),(19,'StableFund 60D','\nProfit Structure: Investments are allocated to mid-term stable loans for users with a history of continuous deposits and Spending account management on the Dave platform for over three months.\nThese users exhibit low deposit/withdrawal risk and high platform loyalty, making them less likely to default.\nFunds are distributed across dozens to hundreds of medium-trust users, and returns are settled daily.',2000.000000,100000.000000,100000000.000000,0.85,60,'2025-07-31 00:00:00','2026-02-27 00:00:00','open',100000000,'2025-07-21 01:51:32',0.000000,'2025-07-27 05:03:55'),(20,'FastCredit 15D','\nProfit Structure: Investments are directed toward a mid-to-short-term liquidity support system targeting Dave’s top-tier credit users.\nUsers participate in automatically analyzed credit-based loan programs (e.g., income-based repayment models), and returns are distributed daily regardless of the repayment cycle.\nAI matches only the top 20% of users based on historical deposit activity and Spending account usage patterns.',1000.000000,30000.000000,100000000000.000000,1.00,15,'2025-07-31 00:00:00','2026-01-20 00:00:00','open',10000000,'2025-07-21 01:51:35',0.000000,'2025-07-27 05:01:52'),(21,'AutoYield 7D','\nProfit Structure: User investments are incorporated into Dave’s ExtraCash™ short-term liquidity support system.\nThis system provides small-scale cash advances to users in urgent need of funds.\nAI analyzes deposit patterns in user accounts to predict repayment reliability.\nFunds are distributed across high-frequency, ultra-short-term loans (1–7 days for repayment).\nThe recovered returns are settled and paid out daily.',500.000000,7000.000000,100000000.000000,1.20,7,'2025-07-31 00:00:00','2026-01-30 00:00:00','open',100000000,'2025-07-21 01:51:37',0.000000,'2025-07-27 04:55:37'),(22,'SmartCredit 30D','\nProfit Structure: Dave’s AI performs automatic loan matching for medium-risk consumers,\nbased on users with a successful history of operating Auto-Save (GOALS) through their Spending accounts.\nInvestor funds are automatically allocated to stable loans expected to be repaid within 30 days.\nDave’s algorithm settles returns based on the estimated repayment date.',1200.000000,70000.000000,1000000000.000000,0.90,30,'2025-08-01 00:00:00','2025-09-01 00:00:00','open',1,'2025-07-27 04:58:28',0.000000,'2025-07-27 05:09:08');
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

-- Dump completed on 2025-07-27  5:12:12
