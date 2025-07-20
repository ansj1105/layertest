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
-- Table structure for table `token_sales`
--

DROP TABLE IF EXISTS `token_sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_sales` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_supply` double NOT NULL,
  `remaining_supply` double NOT NULL,
  `price` double NOT NULL,
  `fee_rate` double DEFAULT '12',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `minimum_purchase` double DEFAULT '10',
  `maximum_purchase` double DEFAULT NULL,
  `lockup_period` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `token_id` (`token_id`),
  CONSTRAINT `token_sales_ibfk_1` FOREIGN KEY (`token_id`) REFERENCES `tokens` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_sales`
--

LOCK TABLES `token_sales` WRITE;
/*!40000 ALTER TABLE `token_sales` DISABLE KEYS */;
INSERT INTO `token_sales` VALUES ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','Phase 1 Pre‑Sale',500000000,499890373,0.05,12,'2025-05-04 08:34:00','2025-05-12 08:34:00',1,1000,100000,125,'2025-05-05 17:34:51','2025-05-13 01:10:03'),('33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','Phase 2 Pre‑Sale',300000000,299968143,0.07,12,'2025-05-05 16:34:51','2025-05-19 17:34:51',1,500,50000,90,'2025-05-05 17:34:51','2025-05-16 08:26:51'),('d0db2ab0-b2a8-48a8-8cd1-143e037c9568','ed299b25-dda1-44d0-8692-d7172fb03f99','일베마스크',8000,6870,0.2,12,'2025-05-11 16:43:00','2025-05-28 16:43:00',1,200,2000,10,'2025-05-13 01:44:08','2025-05-21 11:07:48');
/*!40000 ALTER TABLE `token_sales` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-20 23:43:10
