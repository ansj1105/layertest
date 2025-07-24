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
-- Table structure for table `vip_levels`
--

DROP TABLE IF EXISTS `vip_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vip_levels` (
  `level` tinyint NOT NULL,
  `daily_trade_limit` int DEFAULT NULL,
  `commission_min` decimal(4,2) DEFAULT NULL,
  `commission_max` decimal(4,2) DEFAULT NULL,
  `max_investment` decimal(18,6) DEFAULT NULL,
  `daily_commission_max` decimal(4,2) DEFAULT NULL,
  `min_holdings` decimal(18,6) DEFAULT NULL,
  `min_A` int DEFAULT '0',
  `min_B` int DEFAULT '0',
  `min_C` int DEFAULT '0',
  PRIMARY KEY (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vip_levels`
--

LOCK TABLES `vip_levels` WRITE;
/*!40000 ALTER TABLE `vip_levels` DISABLE KEYS */;
INSERT INTO `vip_levels` VALUES (1,5,1.30,1.60,500.000000,1.60,35.000000,0,0,0),(2,6,1.80,2.10,2000.000000,2.00,500.000000,2,2,2),(3,7,2.20,2.50,5000.000000,2.40,1000.000000,5,5,5),(4,8,2.80,3.20,20000.000000,3.20,3000.000000,15,15,15),(5,9,3.30,3.80,100000.000000,3.80,5000.000000,30,30,30),(6,10,4.50,5.00,200000.000000,5.20,50000.000000,60,60,60);
/*!40000 ALTER TABLE `vip_levels` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-21 16:23:41
