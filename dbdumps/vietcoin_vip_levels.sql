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
INSERT INTO `vip_levels` VALUES (1,5,1.80,2.10,500.000000,1.05,35.000000,0,0,0),(2,6,2.30,2.60,2000.000000,1.30,500.000000,5,0,0),(3,7,2.80,3.10,5000.000000,1.55,2000.000000,10,5,0),(4,8,3.30,3.60,20000.000000,1.80,5000.000000,15,10,5),(5,9,3.80,4.10,100000.000000,2.05,20000.000000,20,15,10),(6,10,4.30,4.60,200000.000000,2.30,100000.000000,25,20,15);
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

-- Dump completed on 2025-07-20 23:43:14
