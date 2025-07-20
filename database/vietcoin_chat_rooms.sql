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
-- Table structure for table `chat_rooms`
--

DROP TABLE IF EXISTS `chat_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `guest_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '비회원 고유 ID (guest_<UUID>)',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_message_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_archived` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_chat_rooms_user_id` (`user_id`),
  KEY `idx_chat_rooms_admin_id` (`admin_id`),
  KEY `idx_guest_id` (`guest_id`),
  CONSTRAINT `fk_chat_rooms_admin` FOREIGN KEY (`admin_id`) REFERENCES `chat_admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_chat_rooms_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_rooms`
--

LOCK TABLES `chat_rooms` WRITE;
/*!40000 ALTER TABLE `chat_rooms` DISABLE KEYS */;
INSERT INTO `chat_rooms` VALUES (1,4,NULL,NULL,'active','2025-05-21 08:51:40','2025-07-20 07:46:16',0),(2,NULL,NULL,'guest_d9be467a-eb7a-41e1-9a6b-b00e225c78d0','active','2025-05-23 03:12:46','2025-05-23 03:12:46',0),(3,NULL,NULL,'guest_2e8bf0de-8814-49bb-843f-7d86d1165fd0','active','2025-05-23 03:13:33','2025-05-23 03:13:33',0),(4,NULL,NULL,'guest_0d7bc2ac-3927-42e1-aaeb-77272fd5b6ac','active','2025-05-23 03:19:46','2025-05-23 03:19:46',0),(5,NULL,NULL,'guest_6cde7f09-2219-4146-82e7-719f9b67c6b0','active','2025-05-23 03:24:55','2025-05-23 03:24:55',0),(6,1,NULL,NULL,'active','2025-05-23 06:43:06','2025-05-23 06:43:06',0),(7,NULL,NULL,'guest_26e3c286-0dba-4623-a39a-0207132e9ad7','active','2025-05-23 06:44:49','2025-05-23 06:44:49',0),(8,NULL,NULL,'guest_18781a26-f9de-4a66-8d49-b1e479e41e07','active','2025-05-23 06:44:52','2025-05-23 06:44:52',0),(9,NULL,NULL,'guest_8c46de41-3675-4c72-8e24-12bd71fe363f','active','2025-05-23 06:45:04','2025-05-23 06:45:04',0),(10,NULL,NULL,'guest_01f187aa-fe59-4e66-9753-9aa275a25e57','active','2025-05-23 06:45:22','2025-05-23 06:45:22',0),(11,NULL,NULL,'guest_a81a42eb-6292-4d01-abc6-8200018aedfa','active','2025-05-23 06:45:45','2025-05-23 06:45:45',0),(12,NULL,NULL,'guest_fc5787f4-fde1-496c-bbf8-2bae172c292a','active','2025-05-23 06:47:21','2025-05-23 06:47:21',0),(13,NULL,NULL,'guest_de4507d9-a2a6-4b61-9e84-b4c1137d9f72','active','2025-05-23 06:50:28','2025-05-23 06:50:28',0),(14,NULL,NULL,'guest_5b824006-a83e-4b98-9995-ac8d68e7c1b3','active','2025-05-23 06:58:14','2025-05-23 06:58:14',0),(15,NULL,NULL,'guest_2a0d346d-00ea-4433-85a2-498af1a184d7','active','2025-05-23 07:00:48','2025-05-23 07:00:48',0),(16,NULL,NULL,'guest_d779cf5d-3ca1-4668-8974-655b93808b62','active','2025-05-23 07:04:22','2025-05-23 07:04:22',0),(17,NULL,NULL,'guest_51de6431-23aa-462c-82b1-d0df7ee4e80b','active','2025-05-23 07:06:03','2025-05-23 07:06:03',0);
/*!40000 ALTER TABLE `chat_rooms` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-20 23:43:06
