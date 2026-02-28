-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: excel
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `certificate_details`
--

DROP TABLE IF EXISTS `certificate_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificate_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cert_no` varchar(100) DEFAULT NULL,
  `cert_date` varchar(50) DEFAULT NULL,
  `delivery_note_no` varchar(100) DEFAULT NULL,
  `delivery_date` varchar(50) DEFAULT NULL,
  `customer_name` varchar(200) DEFAULT NULL,
  `po_no` varchar(100) DEFAULT NULL,
  `po_date` varchar(50) DEFAULT NULL,
  `signature` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificate_details`
--

LOCK TABLES `certificate_details` WRITE;
/*!40000 ALTER TABLE `certificate_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `certificate_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificate_records`
--

DROP TABLE IF EXISTS `certificate_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificate_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `certificate_id` int NOT NULL,
  `po_lineitem_no` int DEFAULT NULL,
  `item_size` varchar(500) DEFAULT NULL,
  `raw_material_size` varchar(300) DEFAULT NULL,
  `tc_no` varchar(100) DEFAULT NULL,
  `traceability_no` varchar(300) DEFAULT NULL,
  `qty_pcs` varchar(50) DEFAULT NULL,
  `material_grade` varchar(300) DEFAULT NULL,
  `c` varchar(50) DEFAULT NULL,
  `cr` varchar(50) DEFAULT NULL,
  `ni` varchar(50) DEFAULT NULL,
  `mo` varchar(50) DEFAULT NULL,
  `mn` varchar(50) DEFAULT NULL,
  `si` varchar(50) DEFAULT NULL,
  `s` varchar(50) DEFAULT NULL,
  `p` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_certificate` (`certificate_id`),
  CONSTRAINT `fk_certificate` FOREIGN KEY (`certificate_id`) REFERENCES `certificate_details` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificate_records`
--

LOCK TABLES `certificate_records` WRITE;
/*!40000 ALTER TABLE `certificate_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `certificate_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `records`
--

DROP TABLE IF EXISTS `records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tc_no` varchar(100) NOT NULL,
  `heat_no` varchar(100) NOT NULL,
  `size` varchar(100) NOT NULL,
  `c` decimal(10,4) DEFAULT NULL,
  `cr` decimal(10,4) DEFAULT NULL,
  `ni` decimal(10,4) DEFAULT NULL,
  `mo` decimal(10,4) DEFAULT NULL,
  `mn` decimal(10,4) DEFAULT NULL,
  `si` decimal(10,4) DEFAULT NULL,
  `s` decimal(10,4) DEFAULT NULL,
  `p` decimal(10,4) DEFAULT NULL,
  `material_grade` varchar(150) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `records`
--

LOCK TABLES `records` WRITE;
/*!40000 ALTER TABLE `records` DISABLE KEYS */;
INSERT INTO `records` VALUES (2,'529016','h4983','Round  20.00 mm',0.0180,5.0000,23.0000,356.0000,0.7200,0.3000,1.0000,0.0210,'F53 (S32750) + NACE MR0175','2026-02-24 07:55:49','2026-02-24 07:55:49'),(3,'018','h4939','Round  120.00 mm',56.0000,45.0000,56.0000,54.0000,6.0000,2.0000,3.0000,0.0210,'F53 (S32750) + NACE MR0175','2026-02-25 06:42:36','2026-02-27 09:13:28');
/*!40000 ALTER TABLE `records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(60) NOT NULL,
  `user_email` varchar(100) NOT NULL,
  `user_pass` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_email` (`user_email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'user1','user1@gmail.com','12345678','2026-02-04 06:40:03','2026-02-04 06:40:03'),(2,'user2','user2@gmail.com','12345678','2026-02-04 06:40:03','2026-02-04 06:40:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-28 15:44:32
