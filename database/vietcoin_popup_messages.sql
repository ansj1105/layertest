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
-- Table structure for table `popup_messages`
--

DROP TABLE IF EXISTS `popup_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `popup_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `popup_messages`
--

LOCK TABLES `popup_messages` WRITE;
/*!40000 ALTER TABLE `popup_messages` DISABLE KEYS */;
INSERT INTO `popup_messages` VALUES (5,'Upstart 공식 안내','성장과 기회의 중심, 새로운 개인화 작업 센터가 개설되었습니다!\n\n지금부터 Upstart 플랫폼은 더욱 정교하고 안정적인 인공지능 기반 수익 시스템을 통해\n사용자의 역량을 극대화할 수 있는 맞춤형 성장 프로그램을 제공합니다.\n\n이 프로그램은 누구에게나 열려 있으며,\n성실한 참여와 전략적인 활동을 통해 글로벌 금융 생태계에서\n여러분만의 커리어와 수익 모델을 구축할 수 있습니다.\n\n이 여정은 단지 보상이 아닌, 성장의 기회입니다.\n업스타트는 여러분이 스스로의 한계를 넘고\n지속가능한 미래를 설계할 수 있도록 돕는\n가장 강력한 파트너가 될 것입니다.\n\n지금 참여하시고,\n블록체인 기반의 미래 금융 생태계를 함께 만들어 가십시오.\n\n우리는 당신의 도전을 기다리고 있습니다.','2025-07-20 13:11:01',1);
/*!40000 ALTER TABLE `popup_messages` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-21 16:24:36
