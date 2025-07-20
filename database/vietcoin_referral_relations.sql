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
-- Table structure for table `referral_relations`
--

DROP TABLE IF EXISTS `referral_relations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `referral_relations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `referrer_id` int NOT NULL,
  `referred_id` int NOT NULL,
  `level` tinyint NOT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `referral_relations`
--

LOCK TABLES `referral_relations` WRITE;
/*!40000 ALTER TABLE `referral_relations` DISABLE KEYS */;
INSERT INTO `referral_relations` VALUES (1,4,6,2,'active','2025-04-21 18:06:36','2025-04-21 18:06:36'),(2,8,10,2,'active','2025-04-22 16:44:03','2025-04-22 16:44:03'),(3,4,11,2,'active','2025-04-23 15:00:21','2025-04-23 15:00:21'),(4,4,12,2,'active','2025-04-23 18:52:13','2025-04-23 18:52:13'),(5,4,13,2,'active','2025-04-23 18:55:28','2025-04-23 18:55:28'),(6,4,14,2,'active','2025-04-23 18:58:20','2025-04-23 18:58:20'),(7,5,15,3,'active','2025-04-28 18:05:29','2025-04-28 18:05:29'),(8,15,16,3,'active','2025-05-03 02:12:16','2025-05-03 02:12:16'),(9,4,18,1,'active','2025-05-03 17:17:53','2025-05-03 17:17:53'),(10,4,5,1,'active','2025-05-03 17:37:37','2025-05-03 17:37:37'),(11,4,6,2,'active','2025-05-03 17:37:37','2025-05-03 17:37:37'),(12,5,6,1,'active','2025-05-03 17:37:37','2025-05-03 17:37:37'),(13,4,7,3,'active','2025-05-03 17:37:37','2025-05-03 17:37:37'),(14,5,7,2,'active','2025-05-03 17:37:37','2025-05-03 17:37:37'),(15,6,7,1,'active','2025-05-03 17:37:37','2025-05-03 17:37:37'),(16,4,19,1,'active','2025-05-03 17:51:56','2025-05-03 17:51:56'),(17,19,20,1,'active','2025-05-03 17:53:31','2025-05-03 17:53:31'),(18,4,20,2,'active','2025-05-03 17:53:31','2025-05-03 17:53:31'),(19,20,21,1,'active','2025-05-03 17:54:12','2025-05-03 17:54:12'),(20,19,21,2,'active','2025-05-03 17:54:12','2025-05-03 17:54:12'),(21,4,21,3,'active','2025-05-03 17:54:12','2025-05-03 17:54:12'),(22,4,22,1,'active','2025-05-03 20:09:13','2025-05-03 20:09:13'),(23,4,23,1,'active','2025-05-03 20:09:33','2025-05-03 20:09:33'),(24,4,24,1,'active','2025-05-09 14:51:51','2025-05-09 14:51:51'),(25,24,26,1,'active','2025-05-12 09:19:03','2025-05-12 09:19:03'),(26,4,26,2,'active','2025-05-12 09:19:03','2025-05-12 09:19:03'),(27,25,27,1,'active','2025-05-28 11:19:12','2025-05-28 11:19:12');
/*!40000 ALTER TABLE `referral_relations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-20 23:43:09
