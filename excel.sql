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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificate_details`
--

LOCK TABLES `certificate_details` WRITE;
/*!40000 ALTER TABLE `certificate_details` DISABLE KEYS */;
INSERT INTO `certificate_details` VALUES (19,'300TC/03/2026','18-Mar-26','28762D','14-Mar-26','Emerson Saudi Arabia LLC','4244003519','21-Jan-26',1,'[\"TEST: ABOVE FITTINGS (L/I: 1 & 2 & 4 & 6 & 7) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT 9000 PSI WITHOUT ANY LEAKAGE.\", \"TEST: ABOVE FITTINGS (L/I: 5) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT 6750 PSI WITHOUT ANY LEAKAGE.\"]','2026-03-18 05:47:37','2026-03-18 05:48:02'),(20,'301TC/03/2026','18-Mar-26','28734D','11-Mar-26','REDA TRADING AND DEVELOPMENT CO. LTD.','FSL-25-0688','21-Nov-25',1,'[\"TEST: ABOVE FITTINGS (L/I: 1) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT 9000 PSI WITHOUT ANY LEAKAGE.\"]','2026-03-18 05:48:40','2026-03-18 05:48:40'),(21,'302TC/03/2026','18-Mar-26','28750D','12-Mar-26','Enpro Industries Pvt. Ltd.','SED 4525012789','09-Feb-26',1,'[\"TEST: ABOVE FITTINGS (L/I: 1 & 2) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT 4500 PSI WITHOUT ANY LEAKAGE.\"]','2026-03-18 05:49:27','2026-03-18 05:49:27'),(22,'303TC/03/2026','18-Mar-26','28649D','22-Feb-26','Yokogawa Saudi Arabia Company L.L.C','4512923371_R2','11-Nov-25',2,'[\"TEST: ABOVE FITTINGS (L/I: 20 & 40 & 110 & 110.1 & 110.2 & 160 & 170) ARE HYDRO TESTED MAKING A SAMPLE LOOP AT 9000 PSI WITHOUT ANY LEAKAGE.\"]','2026-03-18 05:49:59','2026-03-18 05:49:59');
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificate_records`
--

LOCK TABLES `certificate_records` WRITE;
/*!40000 ALTER TABLE `certificate_records` DISABLE KEYS */;
INSERT INTO `certificate_records` VALUES (1,19,1,'SS316 Male Connector 3/8\"ODx1/4\"NPTM\r\nSS-MC64','Hex\r\n 16.00 mm','TC238323','OJ06','6','SS316 / SS316L','0.0220','16.7600','10.0800','2.0300','1.5000','0.3400','0.0230','0.0410',NULL,NULL,NULL,'2026-03-18 05:47:37','2026-03-18 05:47:37'),(2,19,2,'SS316 Female Tee 1/2\"NPTF\r\nSS-F.TEE8','Round\r\n40.00 mm','TC215432','OJ192','2','SS316 / SS316L','0.0190','17.4300','10.0700','2.0300','1.2700','0.5400','0.0220','0.0380',NULL,NULL,NULL,'2026-03-18 05:47:37','2026-03-18 05:47:37'),(3,19,4,'SS316 Pipe Nipple 1/2\"NPTM 2\" Long Sch80\r\nSS-PNIPP8-1.5\"LG-SCH80','1/2\"Pipe','1252-3','OF19','1','SS316 / SS316L','0.0170','16.8900','10.2700','2.0700','1.1800','0.4900','0.0030','0.0400',NULL,NULL,NULL,'2026-03-18 05:47:37','2026-03-18 05:47:37'),(4,19,5,'SS316 Bushing 3/4\"NPTMx1/2\"NPTF\r\nSS-BUSH128','Hex \r\n27.00 mm','TC243627','OK50','2','SS316 / SS316L','0.0240','16.6800','10.0500','2.0300','1.5000','0.4000','0.0220','0.0390',NULL,NULL,NULL,'2026-03-18 05:47:37','2026-03-18 05:47:37'),(5,19,6,'SS316 Male Connector 3/8\"ODx1/2\"NPTM\r\nSS-MC68','Hex \r\n22.20 mm','TC220573','ND66','2','SS316 / SS316L','0.0200','16.6200','10.0500','2.0500','1.5500','0.3200','0.0230','0.0390',NULL,NULL,NULL,'2026-03-18 05:47:37','2026-03-18 05:47:37'),(6,19,7,'SS316 Male Elbow 3/8\"ODx1/2\"NPTM\r\nSS-EM68','Round\r\n25.00 mm','TC133383','LD74','2','SS316 / SS316L','0.0240','16.9300','10.2400','2.0600','1.7700','0.3000','0.0220','0.0410',NULL,NULL,NULL,'2026-03-18 05:47:37','2026-03-18 05:47:37'),(7,20,1,'SS316 2Way Block & Bleed Manifold Needle Valve 1/2\"NPTMx1/2\'\'NPTMx1/4\'\'NPTF 6K\r\nSS-2BB-MNV-8MM-4N-6K','SQ.\r\n32.00 mm','TC243628','OL60','100','SS316 / SS316L','0.0240','16.6800','10.0500','2.0300','1.0500','0.4000','0.0220','0.0390',NULL,NULL,NULL,'2026-03-18 05:48:40','2026-03-18 05:48:40'),(8,21,1,'SS316 Needle Valve 12mmOD Graphite 3K\r\nSS-PNV-SB-M12TT-3K-GRP','SQ\r\n28.50 mm','TC89577','OI183','3','SS316 / SS316L','0.0220','16.7300','10.1100','2.0600','1.7600','0.2800','0.0260','0.0390',NULL,NULL,NULL,'2026-03-18 05:49:27','2026-03-18 05:49:27'),(9,21,2,'SS316 Ball Valve 12mmOD Graphite 3K\r\nSS-PBV-PR-M12TT-3K-GRP','SQ\r\n32.00 mm','TC203250','OH228','2','SS316 / SS316L','0.0230','16.7900','10.0500','2.0300','1.5200','0.2900','0.0250','0.0410',NULL,NULL,NULL,'2026-03-18 05:49:27','2026-03-18 05:49:27'),(10,22,20,'5-Way Manifold SS316/316L, Instrument connection\r\nSS-5C-MNV-8-54-35-6K','Flat Bar\r\n65 x 35 mm','265702','OL380','28','SS316 / SS316L','0.0200','16.7300','10.0800','2.0200','1.6700','0.3400','0.0210','0.0400',NULL,NULL,NULL,'2026-03-18 05:49:59','2026-03-18 05:49:59'),(11,22,40,'Hastelloy 2Way Block & Bleed Manifold Needle Valve 1/2\"NPTFx1/2\"NPTMx1/4\'\'NPTF 6K\r\nH-2BB-MNV-8FM-4N-6K','Round\r\n60.00 mm','812014','OB260','5','SS316 / SS316L','0.0050','15.5200','57.5000','16.0000','0.5500','0.0100','0.0010','0.0050',NULL,NULL,NULL,'2026-03-18 05:49:59','2026-03-18 05:49:59'),(12,22,110,'2-Way Manifold SS316/316L, Instrument connection\r\nSS-2BB-MNV-8FM-4N-6K','SQ\r\n32.00 mm','TC213848','NL23','18','SS316 / SS316L','0.0270','17.1200','10.1000','2.0400','1.5700','0.3100','0.0220','0.0380',NULL,NULL,NULL,'2026-03-18 05:49:59','2026-03-18 05:49:59'),(13,22,110,'2-Way Manifold SS316/316L, Instrument connection\r\nSS-2BB-MNV-8FM-4N-6K','SQ.\r\n32.00 mm','TC243628','OK172','18','SS316 / SS316L','0.0240','16.6800','10.0500','2.0300','1.5000','0.4000','0.0220','0.0390',NULL,NULL,NULL,'2026-03-18 05:49:59','2026-03-18 05:49:59'),(14,22,110,'2-Way Manifold SS316/316L, Instrument connection\r\nSS-2BB-MNV-8FM-4N-6K','SQ.\r\n32.00 mm','TC243628','OK151','18','SS316 / SS316L','0.0240','16.6800','10.0500','2.0300','1.5000','0.4000','0.0220','0.0390',NULL,NULL,NULL,'2026-03-18 05:49:59','2026-03-18 05:49:59'),(15,22,160,'5-Way Manifold, Monel, Instrument connection\r\nM-5C-MNV-8-54-35-6K','Round \r\n80.00 mm','960288','OL453','7','SS316 / SS316L','0.1580',NULL,'65.2000',NULL,'0.8900','0.1700','0.0010',NULL,'31.9000','1.2600','0.0100','2026-03-18 05:49:59','2026-03-18 05:49:59'),(16,22,170,'Monel 2Way R Type Manifold Needle Valve Direct Mount 1/2\"NPTFx1/4\"NPTF 6K\r\nM-2R-MNV-DM-8-54-6K','Round \r\n80.00 mm','960288','OL454','18','SS316 / SS316L','0.1580',NULL,'65.2000',NULL,'0.8900','0.1700','0.0010',NULL,'31.9000','1.2600','0.0100','2026-03-18 05:49:59','2026-03-18 05:49:59');
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `records`
--

LOCK TABLES `records` WRITE;
/*!40000 ALTER TABLE `records` DISABLE KEYS */;
INSERT INTO `records` VALUES (1,'529890','784','h4983','round 20.00mm',0.0040,0.0034,0.4893,0.4890,0.3430,0.4340,0.3440,0.4300,0.3440,0.3430,0.4340,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(2,'TC243628','OL60','S-32790','SQ.\r\n32.00 mm',0.0240,16.6800,10.0500,2.0300,1.0500,0.4000,0.0220,0.0390,NULL,NULL,NULL,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(3,'TC89577','OI183','S-16719','SQ\r\n28.50 mm',0.0220,16.7300,10.1100,2.0600,1.7600,0.2800,0.0260,0.0390,NULL,NULL,NULL,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(4,'TC203250','OH228','S-28547','SQ\r\n32.00 mm',0.0230,16.7900,10.0500,2.0300,1.5200,0.2900,0.0250,0.0410,NULL,NULL,NULL,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(5,'TC238323','OJ06','S-32246','Hex\r\n 16.00 mm',0.0220,16.7600,10.0800,2.0300,1.5000,0.3400,0.0230,0.0410,NULL,NULL,NULL,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(6,'TC215432','OJ192','S-29690','Round\r\n40.00 mm',0.0190,17.4300,10.0700,2.0300,1.2700,0.5400,0.0220,0.0380,NULL,NULL,NULL,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(7,'1252-3','OF19','A05688','1/2\"Pipe',0.0170,16.8900,10.2700,2.0700,1.1800,0.4900,0.0030,0.0400,NULL,NULL,NULL,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(8,'TC243627','OK50','S-32790','Hex \r\n27.00 mm',0.0240,16.6800,10.0500,2.0300,1.5000,0.4000,0.0220,0.0390,NULL,NULL,NULL,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(9,'TC220573','ND66','S-30310','Hex \r\n22.20 mm',0.0200,16.6200,10.0500,2.0500,1.5500,0.3200,0.0230,0.0390,NULL,NULL,NULL,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(10,'TC133383','LD74','S-20682','Round\r\n25.00 mm',0.0240,16.9300,10.2400,2.0600,1.7700,0.3000,0.0220,0.0410,NULL,NULL,NULL,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(11,'265702','OL380','25L0207','Flat Bar\r\n65 x 35 mm',0.0200,16.7300,10.0800,2.0200,1.6700,0.3400,0.0210,0.0400,NULL,NULL,NULL,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(12,'812014','OB260','5415948','Round\r\n60.00 mm',0.0050,15.5200,57.5000,16.0000,0.5500,0.0100,0.0010,0.0050,NULL,NULL,NULL,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(13,'TC213848','NL23','S-29625','SQ\r\n32.00 mm',0.0270,17.1200,10.1000,2.0400,1.5700,0.3100,0.0220,0.0380,NULL,NULL,NULL,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(14,'TC243628','OK172','S-32790','SQ.\r\n32.00 mm',0.0240,16.6800,10.0500,2.0300,1.5000,0.4000,0.0220,0.0390,NULL,NULL,NULL,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(15,'TC243628','OK151','S-32790','SQ.\r\n32.00 mm',0.0240,16.6800,10.0500,2.0300,1.5000,0.4000,0.0220,0.0390,NULL,NULL,NULL,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(16,'960288','OL453','5806071','Round \r\n80.00 mm',0.1580,NULL,65.2000,NULL,0.8900,0.1700,0.0010,NULL,31.9000,1.2600,0.0100,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19'),(17,'960288','OL454','5806071','Round \r\n80.00 mm',0.1580,NULL,65.2000,NULL,0.8900,0.1700,0.0010,NULL,31.9000,1.2600,0.0100,'SS316 / SS316L','2026-03-18 05:43:19','2026-03-18 05:43:19');
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
INSERT INTO `records_min_max_values` VALUES (1,1,'0','100','0','100','0','100','0','100','0','100','0','100','0','100','0','100','0','100','0','100','0','100','2026-03-05 07:29:18','2026-03-18 05:06:47'),(2,2,'0','0.1','20','23','58','0','8','10','0','0.5','0','0.5','0','0.015','0','0.015','-','-','-','-','-','-','2026-03-05 07:29:18','2026-03-05 07:29:18'),(3,3,'1','5','0.002','3.0','17.5','18.5','6','6.5','0','1','0','0.7','0','0.01','0','0.03','-','-','-','-','5','10','2026-03-05 07:29:18','2026-03-17 13:08:29'),(4,4,'0','0.03','24','26','6','8','3','5','0','1.2','0','0.8','0','0.015','0','0.035','-','-','-','-','-','-','2026-03-05 07:29:18','2026-03-05 07:29:18'),(5,5,'0','0.01','14.5','16.5','65.34','70.5','15','17','0','1','0','0.08','0','0.03','0','0.04','-','-','-','-','-','-','2026-03-05 07:29:18','2026-03-05 07:29:18'),(6,6,'0','0.3','-','-','63','72','-','-','0','2','0','0.5','0','0.024','-','-','28','34','0','2.5','0','2','2026-03-05 07:29:18','2026-03-05 07:29:18');
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

-- Dump completed on 2026-03-18 11:23:53
