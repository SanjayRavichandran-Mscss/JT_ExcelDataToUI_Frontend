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
  `test_line_items` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificate_details`
--

LOCK TABLES `certificate_details` WRITE;
/*!40000 ALTER TABLE `certificate_details` DISABLE KEYS */;
INSERT INTO `certificate_details` VALUES (8,'300TC/03/2026','13-Mar-26','27275D','06-Jul-25','Flowserve Abahsain Flow Control Co Ltd.','4543235','26-Feb-25',2,'[\"TEST: ABOVE FITTINGS (L/I: 1 & 2 & 3 & 4 & 5 & 6 & 7 & 8 & 8.1 & 9 & 9.1 & 10 & 11 & 12) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT 4500 PSI WITHOUT ANY LEAKAGE.\"]','2026-03-13 09:22:30','2026-03-13 09:22:30'),(9,'301TC/03/2026','13-Mar-26','27275D','06-Jul-25','Flowserve Abahsain Flow Control Co Ltd.','4543235','26-Feb-25',1,'[\"TEST: ABOVE FITTINGS (L/I: 1 & 3 & 4 & 6) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT 4500 PSI WITHOUT ANY LEAKAGE.\", \"TEST: ABOVE FITTINGS (L/I: 2) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT 3000 PSI WITHOUT ANY LEAKAGE.\"]','2026-03-13 12:23:27','2026-03-13 12:23:27');
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
  `cu` varchar(50) DEFAULT NULL,
  `fe` varchar(50) DEFAULT NULL,
  `co` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_certificate` (`certificate_id`),
  CONSTRAINT `fk_certificate` FOREIGN KEY (`certificate_id`) REFERENCES `certificate_details` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificate_records`
--

LOCK TABLES `certificate_records` WRITE;
/*!40000 ALTER TABLE `certificate_records` DISABLE KEYS */;
INSERT INTO `certificate_records` VALUES (91,8,1,'Male Connector  1\"OD X 1\"NPTM\r\nSS-MC1616','round 20.00mm','529890','OC558','20','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 09:22:30','2026-03-13 09:22:30'),(92,8,2,'Male Connector 1/4\"ODx1/4\"NPTM \r\nH-MC44','round 20.00mm','529890','OF71','12','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 09:22:30','2026-03-13 09:22:30'),(93,8,3,'Male Connector 1/2\"ODx1/4\"NPTM\r\nH-MC84','round 20.00mm','529890','OK40','119','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 09:22:30','2026-03-13 09:22:30'),(94,8,4,'Male Elbow 1/4\"ODx1/4\"NPTM\r\nM-EM44','round 20.00mm','529890','NJ118','25','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 09:22:30','2026-03-13 09:22:30'),(95,8,5,'Male Connector 2\"OD X 2\"NPTM\r\nSS-MC3232','round 20.00mm','529890','OE71','15','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 09:22:30','2026-03-13 09:22:30'),(96,8,6,'Needle Valve 3/4\"OD\r\nM-PNV-SB-12TT-3K','round 20.00mm','529890','OL463','20','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 09:22:30','2026-03-13 09:22:30'),(97,8,7,'Male Connector 1\"OD X 3/4\"NPTM\r\nSS-MC1612','round 20.00mm','529890','OC48','30','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 09:22:30','2026-03-13 09:22:30'),(98,8,8,'Male Connector 1/2\"ODx1/2\"NPTM\r\nM-MC88','round 20.00mm','529890','IE04','25','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 09:22:30','2026-03-13 09:22:30'),(99,8,8,'Male Connector 1/2\"ODx1/2\"NPTM\r\nM-MC88','round 20.00mm','529890','LF31','25','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 09:22:30','2026-03-13 09:22:30'),(100,8,9,'Bushing 1\"NPTMX1/2\"NPTF\r\nSS-BUSH168','round 20.00mm','529890','MK157','15','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 09:22:30','2026-03-13 09:22:30'),(101,8,9,'Bushing 1\"NPTMX1/2\"NPTF\r\nSS-BUSH168','round 20.00mm','529890','NL86','15','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 09:22:30','2026-03-13 09:22:30'),(102,8,10,'Male Elbow 1/2\"ODx1/4\"NPTM\r\nF53-EM84','round 20.00mm','529890','NK81','20','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 09:22:30','2026-03-13 09:22:30'),(103,8,11,'Male Connector 1/2\"ODx1/4\"NPTM\r\n6MO-MC84','round 20.00mm','529890','PA20','5','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 09:22:30','2026-03-13 09:22:30'),(104,8,12,'2Way R Type Manifold Needle Valve Direct Mount 1/2\"NPTFx1/4\"NPTF \r\nM-2R-MNV-DM-8-54-6K','round 20.00mm','529890','OL454','18','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 09:22:30','2026-03-13 09:22:30'),(105,9,1,'Male Connector  1\"OD X 1\"NPTM\r\nSS-MC1616','Round  20.00 mm','529016','OC558','20','F53 (S32750) + NACE MR0175','0.0180','5.0000','23.0000','356.0000','0.7200','0.3000','1.0000','0.0210',NULL,NULL,NULL,'2026-03-13 12:23:27','2026-03-13 12:23:27'),(106,9,2,'Male Connector 1/4\"ODx1/4\"NPTM \r\nH-MC44','25mm','tc-100','OF71','12','F53 (S32750) + NACE MR0175','56.0000','45.0000','56.0000','54.0000','6.0000','2.0000','3.0000','0.0218',NULL,NULL,NULL,'2026-03-13 12:23:27','2026-03-13 12:23:27'),(107,9,3,'Male Connector 1/2\"ODx1/4\"NPTM\r\nH-MC84','Round  20.00 mm','529018','OK40','119','F53 (S32750)','0.0200','25.0000',NULL,NULL,NULL,'0.3000','0.0140','0.0210','5454.3300','656.5600','34.3340','2026-03-13 12:23:27','2026-03-13 12:23:27'),(108,9,4,'Male Elbow 1/4\"ODx1/4\"NPTM\r\nM-EM44','round 20.00mm','529890','NJ118','25','SS316 / SS316L','0.0100','17.0000','13.0000','2.0000','1.0000','1.0000','0.0200','0.0450',NULL,NULL,NULL,'2026-03-13 12:23:27','2026-03-13 12:23:27'),(109,9,5,'Male Connector 2\"OD X 2\"NPTM\r\nSS-MC3232',NULL,NULL,'OE71','15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-13 12:23:27','2026-03-13 12:23:27'),(110,9,6,'Needle Valve 3/4\"OD\r\nM-PNV-SB-12TT-3K','Round  120.00 mm','529018','OL463','20','6MO (S31254)','2.0000','19.5000','17.5000','6.2000','1.0000','0.5000','0.0100','0.0200',NULL,NULL,'6.0000','2026-03-13 12:23:27','2026-03-13 12:23:27'),(111,9,7,'Male Connector 1\"OD X 3/4\"NPTM\r\nSS-MC1612',NULL,NULL,'OC48','30',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-13 12:23:27','2026-03-13 12:23:27'),(112,9,8,'Male Connector 1/2\"ODx1/2\"NPTM\r\nM-MC88',NULL,NULL,'IE04','25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-13 12:23:27','2026-03-13 12:23:27'),(113,9,8,'Male Connector 1/2\"ODx1/2\"NPTM\r\nM-MC88',NULL,NULL,'LF31','25',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-13 12:23:27','2026-03-13 12:23:27'),(114,9,9,'Bushing 1\"NPTMX1/2\"NPTF\r\nSS-BUSH168',NULL,NULL,'MK157','15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-13 12:23:27','2026-03-13 12:23:27'),(115,9,9,'Bushing 1\"NPTMX1/2\"NPTF\r\nSS-BUSH168',NULL,NULL,'NL86','15',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-13 12:23:27','2026-03-13 12:23:27'),(116,9,10,'Male Elbow 1/2\"ODx1/4\"NPTM\r\nF53-EM84',NULL,NULL,'NK81','20',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-13 12:23:27','2026-03-13 12:23:27'),(117,9,11,'Male Connector 1/2\"ODx1/4\"NPTM\r\n6MO-MC84',NULL,NULL,'PA20','5',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-13 12:23:27','2026-03-13 12:23:27'),(118,9,12,'2Way R Type Manifold Needle Valve Direct Mount 1/2\"NPTFx1/4\"NPTF \r\nM-2R-MNV-DM-8-54-6K',NULL,NULL,'OL454','18',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-13 12:23:27','2026-03-13 12:23:27');
/*!40000 ALTER TABLE `certificate_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material_grade_master`
--

DROP TABLE IF EXISTS `material_grade_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `material_grade_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_grade` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_material_grade` (`material_grade`),
  KEY `idx_material_grade` (`material_grade`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material_grade_master`
--

LOCK TABLES `material_grade_master` WRITE;
/*!40000 ALTER TABLE `material_grade_master` DISABLE KEYS */;
INSERT INTO `material_grade_master` VALUES (1,'SS316 / SS316L','2026-03-05 07:04:46','2026-03-05 07:04:46'),(2,'A625 (N06625)','2026-03-05 07:04:46','2026-03-05 07:04:46'),(3,'6MO (S31254)','2026-03-05 07:04:46','2026-03-05 07:04:46'),(4,'F53 (S32750)','2026-03-05 07:04:46','2026-03-05 07:04:46'),(5,'Hastelloy C276','2026-03-05 07:04:46','2026-03-05 07:04:46'),(6,'Monel 400','2026-03-05 07:04:46','2026-03-05 07:04:46');
/*!40000 ALTER TABLE `material_grade_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pressures`
--

DROP TABLE IF EXISTS `pressures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pressures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `size` varchar(100) DEFAULT NULL,
  `working_pressure` varchar(100) DEFAULT NULL,
  `test_pressure` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pressures`
--

LOCK TABLES `pressures` WRITE;
/*!40000 ALTER TABLE `pressures` DISABLE KEYS */;
INSERT INTO `pressures` VALUES (1,'1/4\" OD','6000 PSI','9000 PSI','2026-03-10 12:04:37'),(2,'3/8\" OD','6000 PSI','9000 PSI','2026-03-10 12:04:37'),(3,'1/2\" OD','6000 PSI','9000 PSI','2026-03-10 12:04:37'),(4,'3/4\" OD','4500 PSI','6750 PSI','2026-03-10 12:04:37'),(5,'1\" OD','3000 PSI','4500 PSI','2026-03-10 12:04:37'),(6,'6 MM','6000 PSI','9000 PSI','2026-03-10 12:04:37'),(7,'8 MM','6000 PSI','9000 PSI','2026-03-10 12:04:37'),(8,'10 MM','6000 PSI','9000 PSI','2026-03-10 12:04:37'),(9,'12 MM','6000 PSI','9000 PSI','2026-03-10 12:04:37'),(10,'16 MM','6000 PSI','9000 PSI','2026-03-10 12:04:37'),(11,'18 MM','4500 PSI','6750 PSI','2026-03-10 12:04:37'),(12,'20 MM','4500 PSI','6750 PSI','2026-03-10 12:04:37'),(13,'25 MM','3000 PSI','4500 PSI','2026-03-10 12:04:37'),(14,'3K','3000 PSI','4500 PSI','2026-03-10 12:04:37'),(15,'6K','6000 PSI','9000 PSI','2026-03-10 12:04:37'),(16,'10K','10000 PSI','15000 PSI','2026-03-10 12:04:37'),(17,'15K','15000 PSI','22500 PSI','2026-03-10 12:04:37'),(18,'20K','20000 PSI','30000 PSI','2026-03-10 12:04:37'),(19,'30K','30000 PSI','45000 PSI','2026-03-10 12:04:37');
/*!40000 ALTER TABLE `pressures` ENABLE KEYS */;
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
  `traceability_no` varchar(50) DEFAULT NULL,
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
  `cu` decimal(10,4) DEFAULT NULL,
  `fe` decimal(10,4) DEFAULT NULL,
  `co` decimal(10,4) DEFAULT NULL,
  `material_grade` varchar(150) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `records`
--

LOCK TABLES `records` WRITE;
/*!40000 ALTER TABLE `records` DISABLE KEYS */;
INSERT INTO `records` VALUES (2,'529016','OC558','h4983','Round  20.00 mm',0.0180,5.0000,23.0000,356.0000,0.7200,0.3000,1.0000,0.0210,NULL,NULL,NULL,'F53 (S32750) + NACE MR0175','2026-02-24 07:55:49','2026-03-13 10:58:20'),(5,'tc-100','OF71','H8880','25mm',56.0000,45.0000,56.0000,54.0000,6.0000,2.0000,3.0000,0.0218,NULL,NULL,NULL,'F53 (S32750) + NACE MR0175','2026-03-03 03:53:35','2026-03-13 10:58:20'),(7,'529018','OK40','h4939','Round  20.00 mm',0.0200,25.0000,NULL,NULL,NULL,0.3000,0.0140,0.0210,5454.3300,656.5600,34.3340,'F53 (S32750)','2026-03-05 07:41:27','2026-03-13 10:58:20'),(10,'529890','NJ118','h4983','round 20.00mm',0.0100,17.0000,13.0000,2.0000,1.0000,1.0000,0.0200,0.0450,NULL,NULL,NULL,'SS316 / SS316L','2026-03-06 05:06:40','2026-03-13 10:58:20'),(11,'529018','OL463','h4983','Round  120.00 mm',2.0000,19.5000,17.5000,6.2000,1.0000,0.5000,0.0100,0.0200,NULL,NULL,6.0000,'6MO (S31254)','2026-03-13 10:05:45','2026-03-13 10:58:20'),(12,'529890',NULL,'h4983','round 20.00mm',0.0040,0.0034,0.4893,0.4890,0.3430,0.4340,0.3440,0.4300,0.3440,0.3430,0.4340,'SS316 / SS316L','2026-03-13 12:43:55','2026-03-13 12:43:55');
/*!40000 ALTER TABLE `records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `records_min_max_values`
--

DROP TABLE IF EXISTS `records_min_max_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `records_min_max_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `material_grade_id` int DEFAULT NULL,
  `c_min` varchar(50) DEFAULT NULL,
  `c_max` varchar(50) DEFAULT NULL,
  `cr_min` varchar(50) DEFAULT NULL,
  `cr_max` varchar(50) DEFAULT NULL,
  `ni_min` varchar(50) DEFAULT NULL,
  `ni_max` varchar(50) DEFAULT NULL,
  `mo_min` varchar(50) DEFAULT NULL,
  `mo_max` varchar(50) DEFAULT NULL,
  `mn_min` varchar(50) DEFAULT NULL,
  `mn_max` varchar(50) DEFAULT NULL,
  `si_min` varchar(50) DEFAULT NULL,
  `si_max` varchar(50) DEFAULT NULL,
  `s_min` varchar(50) DEFAULT NULL,
  `s_max` varchar(50) DEFAULT NULL,
  `p_min` varchar(50) DEFAULT NULL,
  `p_max` varchar(50) DEFAULT NULL,
  `cu_min` varchar(50) DEFAULT NULL,
  `cu_max` varchar(50) DEFAULT NULL,
  `fe_min` varchar(50) DEFAULT NULL,
  `fe_max` varchar(50) DEFAULT NULL,
  `co_min` varchar(50) DEFAULT NULL,
  `co_max` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_records_min_max_values_material_grade` (`material_grade_id`),
  CONSTRAINT `fk_records_min_max_values_material_grade` FOREIGN KEY (`material_grade_id`) REFERENCES `material_grade_master` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `records_min_max_values`
--

LOCK TABLES `records_min_max_values` WRITE;
/*!40000 ALTER TABLE `records_min_max_values` DISABLE KEYS */;
INSERT INTO `records_min_max_values` VALUES (1,1,'0','50','0','50','0','80','0','85','0','50','0','50','0','50','0','50','0','50','0','50','0','50','2026-03-05 07:29:18','2026-03-13 12:45:35'),(2,2,'0','0.1','20','23','58','0','8','10','0','0.5','0','0.5','0','0.015','0','0.015','-','-','-','-','-','-','2026-03-05 07:29:18','2026-03-05 07:29:18'),(3,3,'1','3','19.5','20.5','17.5','18.5','6','6.5','0','1','0','0.7','0','0.01','0','0.03','-','-','-','-','5','10','2026-03-05 07:29:18','2026-03-09 07:26:25'),(4,4,'0','0.03','24','26','6','8','3','5','0','1.2','0','0.8','0','0.015','0','0.035','-','-','-','-','-','-','2026-03-05 07:29:18','2026-03-05 07:29:18'),(5,5,'0','0.01','14.5','16.5','65.34','70.5','15','17','0','1','0','0.08','0','0.03','0','0.04','-','-','-','-','-','-','2026-03-05 07:29:18','2026-03-05 07:29:18'),(6,6,'0','0.3','-','-','63','72','-','-','0','2','0','0.5','0','0.024','-','-','28','34','0','2.5','0','2','2026-03-05 07:29:18','2026-03-05 07:29:18');
/*!40000 ALTER TABLE `records_min_max_values` ENABLE KEYS */;
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

-- Dump completed on 2026-03-13 18:23:12
