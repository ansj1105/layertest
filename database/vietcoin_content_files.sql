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
-- Table structure for table `content_files`
--

DROP TABLE IF EXISTS `content_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `content_files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('banner','video','pdf') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','inactive','deleted') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `content_files`
--

LOCK TABLES `content_files` WRITE;
/*!40000 ALTER TABLE `content_files` DISABLE KEYS */;
INSERT INTO `content_files` VALUES (1,'banner','/uploads/1744907176726.png','2025-04-17 16:26:16','deleted'),(3,'video','/uploads/1744907247119.mp4','2025-04-17 16:27:27','deleted'),(5,'banner','/uploads/1746547933397.png','2025-05-06 16:12:13','deleted'),(6,'banner','/uploads/1746548148255.png','2025-05-06 16:15:48','deleted'),(7,'banner','/uploads/1746548782621.png','2025-05-06 16:26:22','deleted'),(19,'video','/uploads/1747987778032.mp4','2025-05-23 08:09:38','active'),(21,'banner','/uploads/1747987811007.png','2025-05-23 08:10:11','active'),(22,'banner','/uploads/1747987814875.png','2025-05-23 08:10:14','active'),(23,'banner','/uploads/1747987820134.png','2025-05-23 08:10:20','active'),(24,'banner','/uploads/1747987824521.png','2025-05-23 08:10:24','active'),(26,'pdf','/uploads/1753011980774.pdf','2025-07-20 11:46:21','active');
/*!40000 ALTER TABLE `content_files` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-21 16:27:08
