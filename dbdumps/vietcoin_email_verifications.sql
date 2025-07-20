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
-- Table structure for table `email_verifications`
--

DROP TABLE IF EXISTS `email_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT 'users.id 참조',
  `email` varchar(255) NOT NULL COMMENT '인증 대상 이메일',
  `code` char(6) NOT NULL COMMENT '발급된 6자리 인증 코드',
  `type` enum('old','new','trade') NOT NULL,
  `expires_at` datetime NOT NULL COMMENT '만료 시각',
  `used` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1: 이미 사용된 코드',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `used_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_type_email_code` (`user_id`,`type`,`email`,`code`),
  KEY `idx_ev_user` (`user_id`),
  KEY `idx_ev_type` (`type`),
  KEY `idx_ev_expires` (`expires_at`),
  CONSTRAINT `email_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='이메일 인증 코드 저장';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verifications`
--

LOCK TABLES `email_verifications` WRITE;
/*!40000 ALTER TABLE `email_verifications` DISABLE KEYS */;
INSERT INTO `email_verifications` VALUES (1,1,'ansj1105@naver.com','2E5F64','old','2025-05-01 16:12:10',0,'2025-05-01 16:49:23',NULL),(2,1,'ansj1105@naver.com','2F376C','old','2025-05-01 16:12:11',0,'2025-05-01 16:49:23',NULL),(3,1,'ansj1105@naver.com','058A7F','old','2025-05-01 16:12:16',0,'2025-05-01 16:49:23',NULL),(4,4,'tete@test.com','674319','old','2025-05-01 16:52:39',0,'2025-05-01 16:49:23',NULL),(5,1,'ansj1105@naver.com','63C2C0','trade','2025-05-01 16:54:58',0,'2025-05-01 16:49:23',NULL),(6,1,'ansj1105@naver.com','E44250','trade','2025-05-01 16:55:18',0,'2025-05-01 16:49:23',NULL),(7,1,'ansj1105@naver.com','BE03BF','trade','2025-05-01 16:56:19',0,'2025-05-01 16:49:23',NULL),(8,1,'ansj1105@naver.com','3B784A','old','2025-05-01 16:57:04',0,'2025-05-01 16:49:23',NULL),(9,1,'ansj1105@naver.com','BF8151','trade','2025-05-01 17:02:10',0,'2025-05-01 16:52:10',NULL),(10,1,'ansj1105@naver.com','2BC232','old','2025-05-01 17:07:20',0,'2025-05-01 16:57:19',NULL),(11,1,'ansj1105@naver.com','1D2FC2','old','2025-05-01 17:24:04',0,'2025-05-01 17:14:04',NULL),(12,4,'tete@test.com','E2C64C','trade','2025-05-01 17:27:25',1,'2025-05-01 17:17:24',NULL),(13,4,'tete@test.com','3F2016','old','2025-05-15 12:27:01',0,'2025-05-15 12:17:01',NULL),(14,4,'tete@test.com','E97BF0','old','2025-05-15 12:27:02',0,'2025-05-15 12:17:02',NULL);
/*!40000 ALTER TABLE `email_verifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-20 23:43:04
