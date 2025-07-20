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
-- Table structure for table `chat_guests`
--

DROP TABLE IF EXISTS `chat_guests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_guests` (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '비회원 고유 ID (예: guest_<UUID>)',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '비회원 이름',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '비회원 이메일',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_guests`
--

LOCK TABLES `chat_guests` WRITE;
/*!40000 ALTER TABLE `chat_guests` DISABLE KEYS */;
INSERT INTO `chat_guests` VALUES ('guest_01f187aa-fe59-4e66-9753-9aa275a25e57','22','ansj1105@naver.com','2025-05-23 06:45:22'),('guest_0d7bc2ac-3927-42e1-aaeb-77272fd5b6ac','일베마스크','ansj1105@naver.com','2025-05-23 03:19:46'),('guest_18781a26-f9de-4a66-8d49-b1e479e41e07','일베마스크2','ansj1105@naver.com','2025-05-23 06:44:52'),('guest_26e3c286-0dba-4623-a39a-0207132e9ad7','일베마스크','ansj1105@naver.com','2025-05-23 06:44:49'),('guest_2a0d346d-00ea-4433-85a2-498af1a184d7','일베마스크','ansj1105@naver.com','2025-05-23 07:00:48'),('guest_2e8bf0de-8814-49bb-843f-7d86d1165fd0','일베마스크','ansj1105@naver.com','2025-05-23 03:13:33'),('guest_51de6431-23aa-462c-82b1-d0df7ee4e80b','22','ansj1105@naver.com','2025-05-23 07:06:03'),('guest_5b824006-a83e-4b98-9995-ac8d68e7c1b3','일베마스크','ansj1105@naver.com','2025-05-23 06:58:14'),('guest_6a06939b-489e-4ad0-8889-c51745d67fba','일베마스크','ansj1105@naver.com','2025-05-23 03:11:38'),('guest_6cde7f09-2219-4146-82e7-719f9b67c6b0','일베마스크','ansj1105@naver.com','2025-05-23 03:24:55'),('guest_8c46de41-3675-4c72-8e24-12bd71fe363f','일베마스크2','ansj1105@naver.com2','2025-05-23 06:45:04'),('guest_8c9f6493-db89-4934-834f-c9f7363d40e3','a@a.a','ansj1105@naver.com','2025-05-23 03:07:36'),('guest_a81a42eb-6292-4d01-abc6-8200018aedfa','22','ansj1105@naver.com','2025-05-23 06:45:45'),('guest_c490f755-2a86-4c98-85e5-1e10a8eb0209','a@a.a','ansj1105@naver.com','2025-05-23 03:08:23'),('guest_d779cf5d-3ca1-4668-8974-655b93808b62','일베마스크','ansj1105@naver.com','2025-05-23 07:04:22'),('guest_d9be467a-eb7a-41e1-9a6b-b00e225c78d0','일베마스크','ansj1105@naver.com','2025-05-23 03:12:46'),('guest_de4507d9-a2a6-4b61-9e84-b4c1137d9f72','일베마스크','ansj1105@naver.com','2025-05-23 06:50:28'),('guest_ef040cf1-c35f-4be0-be9f-95e92838a6ef','a@a.a','ansj1105@naver.com','2025-05-23 03:11:27'),('guest_fc5787f4-fde1-496c-bbf8-2bae172c292a','일베마스크','ansj1105@naver.com','2025-05-23 06:47:21');
/*!40000 ALTER TABLE `chat_guests` ENABLE KEYS */;
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
