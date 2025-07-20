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
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `sender_type` enum('user','admin','guest') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `sender_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chat_messages_room_id` (`room_id`),
  KEY `idx_chat_messages_created_at` (`created_at`),
  CONSTRAINT `fk_chat_messages_room` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (1,1,'user','4','22',1,'2025-05-23 02:38:30'),(2,1,'user','4','바보년 ',1,'2025-05-23 02:42:15'),(3,1,'user','4','12',1,'2025-05-23 02:59:18'),(4,1,'user','4','테스트',1,'2025-05-23 03:00:06'),(5,1,'user','4','2222',1,'2025-05-23 03:19:31'),(6,1,'user','4','12123123',1,'2025-05-23 03:19:34'),(7,5,'guest','guest_6cde7f09-2219-4146-82e7-719f9b67c6b0','2222',0,'2025-05-23 03:25:57'),(8,15,'admin','1','22',0,'2025-05-23 07:00:48'),(9,15,'guest','guest_2a0d346d-00ea-4433-85a2-498af1a184d7','11',0,'2025-05-23 07:02:03'),(10,16,'admin','1','22',0,'2025-05-23 07:04:22'),(11,17,'admin','1','22',0,'2025-05-23 07:06:03'),(12,4,'guest','guest_0d7bc2ac-3927-42e1-aaeb-77272fd5b6ac','111',0,'2025-05-23 07:07:59'),(13,4,'guest','guest_0d7bc2ac-3927-42e1-aaeb-77272fd5b6ac','2222',0,'2025-05-23 07:08:10'),(14,6,'admin','4','22222',1,'2025-05-23 07:32:16'),(15,6,'admin','4','21312312412',1,'2025-05-23 07:33:21'),(16,6,'admin','4','2222',1,'2025-05-23 07:41:18'),(17,17,'admin','4','22222',0,'2025-05-23 07:48:41'),(18,10,'guest','guest_01f187aa-fe59-4e66-9753-9aa275a25e57','12312312',0,'2025-05-23 07:49:30'),(19,10,'guest','guest_01f187aa-fe59-4e66-9753-9aa275a25e57','123123123',0,'2025-05-23 07:49:33'),(20,17,'admin','1','222',0,'2025-05-23 07:49:54'),(21,1,'user','4','22',1,'2025-05-23 07:55:50'),(22,17,'admin','4','22',0,'2025-05-23 07:58:01'),(23,6,'admin','4','222',1,'2025-05-23 08:07:18'),(24,1,'admin','1','123213123',1,'2025-05-23 08:22:01'),(25,1,'admin','4','222',1,'2025-05-23 08:23:30'),(26,1,'user','4','11',1,'2025-05-23 08:57:35'),(27,1,'admin','4','22',1,'2025-05-23 08:58:03'),(28,1,'user','4','12312',1,'2025-05-23 09:07:44'),(29,1,'admin','4','111',1,'2025-05-23 09:16:17'),(30,6,'admin','1','아 ㅈ같다',1,'2025-07-20 07:20:42'),(31,1,'admin','1','ㅋㅋㅋ',1,'2025-07-20 07:20:49'),(32,1,'user','4','zz',1,'2025-07-20 07:21:10'),(33,1,'admin','4','zzzzzzzzzzzz',1,'2025-07-20 07:26:24'),(34,1,'user','4','zzz',1,'2025-07-20 07:26:34'),(35,1,'admin','4','zzzzzz2313',1,'2025-07-20 07:28:37'),(36,1,'admin','4','123123',1,'2025-07-20 07:30:22'),(37,1,'admin','4','zzz',1,'2025-07-20 07:30:34'),(38,1,'admin','4','213123',1,'2025-07-20 07:32:21'),(39,1,'admin','4','2222',1,'2025-07-20 07:32:39'),(40,1,'admin','4','222',1,'2025-07-20 07:34:02'),(41,1,'user','4','zzz',1,'2025-07-20 07:34:12'),(42,1,'admin','4','23141',1,'2025-07-20 07:34:17'),(43,1,'admin','4','2222',1,'2025-07-20 07:34:34'),(44,1,'admin','4','zzz',1,'2025-07-20 07:35:44'),(45,1,'admin','4','222',1,'2025-07-20 07:38:46'),(46,1,'admin','4','123123',1,'2025-07-20 07:39:34'),(47,1,'admin','4','222',1,'2025-07-20 07:40:09'),(48,1,'admin','4','안녕',1,'2025-07-20 07:43:07'),(49,1,'admin','4','222',1,'2025-07-20 07:43:29'),(50,1,'user','4','222',1,'2025-07-20 07:43:39'),(51,1,'admin','4','ㄴㄴ',1,'2025-07-20 07:43:47'),(52,1,'user','4','2212',1,'2025-07-20 07:43:52'),(53,1,'user','4','222',1,'2025-07-20 07:44:02'),(54,1,'user','4','22',1,'2025-07-20 07:46:04'),(55,1,'admin','4','111',1,'2025-07-20 07:46:10'),(56,1,'admin','4','222',1,'2025-07-20 07:46:16');
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
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
