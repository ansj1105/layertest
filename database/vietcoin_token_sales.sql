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
INSERT INTO `token_sales` VALUES ('b6de1f59-5b55-43db-b9fc-a235ac937d48','11111111-1111-1111-1111-111111111111','1st pre-sale',500000000,500000000,0.06,0,'2025-08-01 00:00:00','2025-08-14 00:00:00',1,10000,1000000,145,'2025-07-21 02:33:01','2025-07-21 02:33:23'),('d9518b43-66f7-4ed4-978f-04b10d351ea5','31eb181c-b66b-4ab2-bde9-3a73a4f1b6e0','3rd pre-sale',500000000,500000000,0.10,0,'2025-10-01 00:00:00','2025-10-14 00:00:00',1,10000,1000000,80,'2025-07-21 07:42:15','2025-07-21 07:42:15'),('e65911cd-eb85-44e5-bdec-a54f9e10ee00','ed299b25-dda1-44d0-8692-d7172fb03f99','2nd pre-sale',500000000,50000000,0.08,0,'2025-09-01 00:00:00','2025-09-14 00:00:00',1,10000,1000000,110,'2025-07-21 07:38:00','2025-07-21 07:38:22');
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

-- Dump completed on 2025-07-21 16:45:12
