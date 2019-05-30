-- MySQL dump 10.13  Distrib 5.7.24, for Linux (x86_64)
--
-- Host: church-department-infant.cwfhoavfyutf.ap-northeast-2.rds.amazonaws.com    Database: db_infant
-- ------------------------------------------------------
-- Server version	5.6.41-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `db_infant`
--

--
-- Table structure for table `CHOIR_ATTENDANCE`
--

DROP TABLE IF EXISTS `CHOIR_ATTENDANCE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CHOIR_ATTENDANCE` (
  `WORSHIP_DT` varchar(10) NOT NULL,
  `WORSHIP_CD` varchar(20) DEFAULT NULL,
  `MEMBER_ID` int(11) NOT NULL,
  PRIMARY KEY (`WORSHIP_DT`,`MEMBER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CHOIR_ATTENDANCE`
--

LOCK TABLES `CHOIR_ATTENDANCE` WRITE;
/*!40000 ALTER TABLE `CHOIR_ATTENDANCE` DISABLE KEYS */;
INSERT INTO `CHOIR_ATTENDANCE` VALUES ('2019-01-06','WORSHIP',3),('2019-01-06','WORSHIP',4),('2019-01-06','WORSHIP',5),('2019-01-06','WORSHIP',6),('2019-01-06','WORSHIP',10),('2019-01-06','WORSHIP',15),('2019-01-06','WORSHIP',16),('2019-01-06','WORSHIP',17),('2019-01-06','WORSHIP',19),('2019-01-06','WORSHIP',20),('2019-01-13','WORSHIP',5),('2019-01-13','WORSHIP',6),('2019-01-13','WORSHIP',7),('2019-01-13','WORSHIP',8),('2019-01-13','WORSHIP',10),('2019-01-13','WORSHIP',13),('2019-01-13','WORSHIP',16),('2019-01-13','WORSHIP',19),('2019-01-13','WORSHIP',20);
/*!40000 ALTER TABLE `CHOIR_ATTENDANCE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CHOIR_CODE`
--

DROP TABLE IF EXISTS `CHOIR_CODE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CHOIR_CODE` (
  `GRP_CD` varchar(20) NOT NULL,
  `CMN_CD` varchar(20) NOT NULL,
  `CMN_NM` varchar(30) NOT NULL,
  `OPT_1` varchar(30) DEFAULT NULL,
  `OPT_2` varchar(30) DEFAULT NULL,
  `OPT_3` varchar(30) DEFAULT NULL,
  `USE_YN` varchar(1) NOT NULL DEFAULT 'Y',
  `ORDERBY_NO` int(11) NOT NULL,
  PRIMARY KEY (`GRP_CD`,`CMN_CD`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CHOIR_CODE`
--

LOCK TABLES `CHOIR_CODE` WRITE;
/*!40000 ALTER TABLE `CHOIR_CODE` DISABLE KEYS */;
INSERT INTO `CHOIR_CODE` VALUES ('BAPTISM','BAPTISM','세례','',NULL,NULL,'Y',40),('BAPTISM','INFANT','유아세례','',NULL,NULL,'Y',20),('BAPTISM','LEARNING','학습세례','',NULL,NULL,'Y',30),('BAPTISM','NONE','성도','',NULL,NULL,'Y',10),('GENDER','M','남',NULL,NULL,NULL,'Y',80),('GENDER','W','여',NULL,NULL,NULL,'Y',40),('STATUS','ABSENCE','장기결석',NULL,NULL,NULL,'Y',10),('STATUS','ATTENDENCE','출석중',NULL,NULL,NULL,'Y',20),('STATUS','PART','부분출석',NULL,NULL,NULL,'Y',30);
/*!40000 ALTER TABLE `CHOIR_CODE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CHOIR_C_POSITION`
--

DROP TABLE IF EXISTS `CHOIR_C_POSITION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CHOIR_C_POSITION` (
  `C_POSITION_CD` varchar(10) NOT NULL DEFAULT '',
  `C_POSITION_NM` varchar(20) NOT NULL,
  `USE_YN` char(1) NOT NULL DEFAULT 'Y',
  `ORDERBY_NO` int(11) NOT NULL,
  PRIMARY KEY (`C_POSITION_CD`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CHOIR_C_POSITION`
--

LOCK TABLES `CHOIR_C_POSITION` WRITE;
/*!40000 ALTER TABLE `CHOIR_C_POSITION` DISABLE KEYS */;
INSERT INTO `CHOIR_C_POSITION` VALUES ('ST','학생','Y',10),('TC','선생님','Y',20);
/*!40000 ALTER TABLE `CHOIR_C_POSITION` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CHOIR_MEMBER`
--

DROP TABLE IF EXISTS `CHOIR_MEMBER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CHOIR_MEMBER` (
  `MEMBER_ID` int(11) NOT NULL AUTO_INCREMENT,
  `MEMBER_NM` varchar(20) NOT NULL,
  `BIRTHDAY` varchar(20) DEFAULT NULL,
  `PHONE_NO` varchar(20) DEFAULT NULL,
  `E_MAIL` varchar(50) DEFAULT NULL,
  `ADDRESS` mediumtext,
  `PART_CD` varchar(20) NOT NULL,
  `GENDER_CD` varchar(10) NOT NULL DEFAULT 'M',
  `BAPTISM_CD` varchar(20) NOT NULL DEFAULT 'NONE',
  `STATUS_CD` varchar(20) NOT NULL DEFAULT 'ATTENDENCE',
  `MODIFY_DT` date DEFAULT NULL,
  `ETC_MSG` mediumtext,
  `REG_DT` date DEFAULT NULL,
  `FATHER_NM` varchar(20) DEFAULT NULL,
  `FATHER_PHONE` varchar(13) DEFAULT NULL,
  `MOTHER_NM` varchar(20) DEFAULT NULL,
  `MOTHER_PHONE` varchar(20) DEFAULT NULL,
  `SCHOOL` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`MEMBER_ID`),
  KEY `IDX_STATUS_CD` (`STATUS_CD`),
  KEY `IDX_POSITION_CD` (`GENDER_CD`),
  KEY `IDX_PART_CD` (`PART_CD`),
  KEY `IDX_MEMBER_PART_3` (`PART_CD`,`GENDER_CD`,`BAPTISM_CD`,`STATUS_CD`),
  KEY `IDX_MEMBER_PART_2` (`PART_CD`,`GENDER_CD`,`STATUS_CD`),
  KEY `IDX_MEMBER_PART_1` (`PART_CD`,`STATUS_CD`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CHOIR_MEMBER`
--

LOCK TABLES `CHOIR_MEMBER` WRITE;
/*!40000 ALTER TABLE `CHOIR_MEMBER` DISABLE KEYS */;
INSERT INTO `CHOIR_MEMBER` VALUES (2,'김시아','2017-10-14','010-9374-3435','','주소','1','W','INFANT','ATTENDENCE','2010-12-17','메모','2019-01-01','','','','','미취학'),(3,'김서진','2015-11-18','010-9161-5182','','','1','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(4,'김서연','','','','','1','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(5,'류예준','2017-08-08','','','','2','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(6,'송현서','2017-05-22','010-5634-1028','','','2','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(7,'오선우','2017-04-25','010-2644-8708','','','2','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(8,'정시온','2017-03-31','010-9905-5836','','','2','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(9,'이하린','2016-07-18','010-8299-8110','','','3','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(10,'김주원','2017-11-14','010-4934-7231','','','3','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(11,'임세은','2017-12-08','010-3311-2103','','','3','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(12,'서지안','2018-06-09','010-4703-4101','','','3','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(13,'최이도','2018-03-27','010-5665-6785','','','4','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(14,'김성령','2018-06-23','010-8583-2144','','','4','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(15,'김시윤','2015-10-20','010-7190-0566','','','4','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(16,'김지율','2018-08-10','010-2879-5114','','','1','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(17,'박시현','2017-05-14','010-9263-8767','','','5','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(18,'이용언','','010-2548-4815','','','5','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(19,'김시온','2017-10-02','010-8881-7716','','','1','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(20,'김예원','2017-12-18','010-4199-3820','','','5','W','INFANT','ATTENDENCE','2019-01-01','','2019-01-01',NULL,NULL,NULL,NULL,NULL),(21,'류현모','','',NULL,NULL,'6','W','INFANT','ATTENDENCE','2019-01-01',NULL,'2019-01-01',NULL,NULL,NULL,NULL,NULL),(22,'김시오',NULL,NULL,NULL,NULL,'6','W','INFANT','ATTENDENCE','2019-01-01',NULL,'2019-01-01',NULL,NULL,NULL,NULL,NULL),(38,'이상웅',NULL,NULL,NULL,NULL,'1','W','NONE','ABSENCE','2019-01-01',NULL,'2019-01-01',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `CHOIR_MEMBER` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CHOIR_PART`
--

DROP TABLE IF EXISTS `CHOIR_PART`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CHOIR_PART` (
  `PART_CD` varchar(10) NOT NULL DEFAULT '',
  `PART_ENG_NM` varchar(20) NOT NULL,
  `PART_NM` varchar(20) NOT NULL,
  `USE_YN` char(1) NOT NULL DEFAULT 'Y',
  `ORDERBY_NO` int(11) NOT NULL,
  PRIMARY KEY (`PART_CD`),
  KEY `idx_USE_YN` (`USE_YN`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CHOIR_PART`
--

LOCK TABLES `CHOIR_PART` WRITE;
/*!40000 ALTER TABLE `CHOIR_PART` DISABLE KEYS */;
INSERT INTO `CHOIR_PART` VALUES ('1','A1','아브라함반','Y',10),('2','A2','모세반','Y',20),('3','A3','요셉반','Y',30),('4','A4','노아반','Y',40),('5','A5','여호아반','Y',50),('6','A6','다윗반','Y',60);
/*!40000 ALTER TABLE `CHOIR_PART` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CHOIR_POSITION`
--

DROP TABLE IF EXISTS `CHOIR_POSITION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CHOIR_POSITION` (
  `POSITION_CD` varchar(10) NOT NULL,
  `POSITION_NM` varchar(20) NOT NULL,
  `USE_YN` char(1) NOT NULL DEFAULT 'Y',
  `ORDERBY_NO` int(11) NOT NULL,
  PRIMARY KEY (`POSITION_CD`),
  KEY `idx_CHOIR_POSITION_USE_YN` (`USE_YN`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CHOIR_POSITION`
--

LOCK TABLES `CHOIR_POSITION` WRITE;
/*!40000 ALTER TABLE `CHOIR_POSITION` DISABLE KEYS */;
INSERT INTO `CHOIR_POSITION` VALUES ('JS','유아세례','Y',10),('NONE','세례안받음','Y',20);
/*!40000 ALTER TABLE `CHOIR_POSITION` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CHOIR_STATUS`
--

DROP TABLE IF EXISTS `CHOIR_STATUS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CHOIR_STATUS` (
  `STATUS_CD` char(1) NOT NULL,
  `STATUS_NM` varchar(20) NOT NULL,
  `USE_YN` char(1) NOT NULL DEFAULT 'Y',
  `ORDERBY_NO` int(11) NOT NULL,
  PRIMARY KEY (`STATUS_CD`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CHOIR_STATUS`
--

LOCK TABLES `CHOIR_STATUS` WRITE;
/*!40000 ALTER TABLE `CHOIR_STATUS` DISABLE KEYS */;
INSERT INTO `CHOIR_STATUS` VALUES ('H','출석중','Y',10),('O','장기결석','Y',20);
/*!40000 ALTER TABLE `CHOIR_STATUS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CHOIR_WORSHIP`
--

DROP TABLE IF EXISTS `CHOIR_WORSHIP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CHOIR_WORSHIP` (
  `WORSHIP_DT` varchar(10) NOT NULL DEFAULT '',
  `WORSHIP_CD` varchar(10) NOT NULL DEFAULT '',
  `INFO` mediumtext,
  `ETC_MSG` mediumtext,
  `LOCK_YN` char(1) NOT NULL DEFAULT 'N',
  PRIMARY KEY (`WORSHIP_DT`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CHOIR_WORSHIP`
--

LOCK TABLES `CHOIR_WORSHIP` WRITE;
/*!40000 ALTER TABLE `CHOIR_WORSHIP` DISABLE KEYS */;
INSERT INTO `CHOIR_WORSHIP` VALUES ('2019-01-06','WORSHIP','주일예배2','신년예배','N'),('2019-01-13','WORSHIP','주일예배','','N'),('2019-01-20','WORSHIP','주일예배','','N'),('2019-01-27','WORSHIP','주일예배','','N'),('2019-02-03','WORSHIP','주일예배','','N'),('2019-02-10','WORSHIP','주일예배','','N'),('2019-02-17','WORSHIP','주일예배','','N'),('2019-02-24','WORSHIP','주일예배','','N'),('2019-03-03','WORSHIP','주일예배','','N'),('2019-03-10','WORSHIP','주일예배','','N'),('2019-03-17','WORSHIP','주일예배','','N'),('2019-03-24','WORSHIP','주일예배','','N'),('2019-03-31','WORSHIP','주일예배','상반기총동원전도','N'),('2019-04-07','WORSHIP','주일예배','','N'),('2019-04-14','WORSHIP','주일예배','고난주일','N'),('2019-04-21','WORSHIP','주일예배','부활주일','N'),('2019-04-28','WORSHIP','주일예배','','N'),('2019-05-05','WORSHIP','주일예배','','N'),('2019-05-12','WORSHIP','주일예배','','N'),('2019-05-19','WORSHIP','주일예배','','N'),('2019-05-26','WORSHIP','주일예배','','N'),('2019-06-02','WORSHIP','주일예배','','N'),('2019-06-09','WORSHIP','주일예배','','N'),('2019-06-16','WORSHIP','주일예배','','N'),('2019-06-23','WORSHIP','주일예배','','N'),('2019-06-30','WORSHIP','주일예배','','N'),('2019-07-07','WORSHIP','주일예배','맥추감사','N'),('2019-07-14','WORSHIP','주일예배','','N'),('2019-07-21','WORSHIP','주일예배','','N'),('2019-07-28','WORSHIP','주일예배','','N'),('2019-08-04','WORSHIP','주일예배','','N'),('2019-08-11','WORSHIP','주일예배','','N'),('2019-08-18','WORSHIP','주일예배','','N'),('2019-08-25','WORSHIP','주일예배','','N'),('2019-09-01','WORSHIP','주일예배','','N'),('2019-09-08','WORSHIP','주일예배','','N'),('2019-09-15','WORSHIP','주일예배','','N'),('2019-09-22','WORSHIP','주일예배','','N'),('2019-09-29','WORSHIP','주일예배','','N'),('2019-10-06','WORSHIP','주일예배','','N'),('2019-10-13','WORSHIP','주일예배','','N'),('2019-10-20','WORSHIP','주일예배','','N'),('2019-10-27','WORSHIP','주일예배','교사박람회','N'),('2019-11-03','WORSHIP','주일예배','','N'),('2019-11-10','WORSHIP','주일예배','','N'),('2019-11-17','WORSHIP','주일예배','추수감사','N'),('2019-11-24','WORSHIP','주일예배','','N'),('2019-12-01','WORSHIP','주일예배','','N'),('2019-12-08','WORSHIP','주일예배','','N'),('2019-12-15','WORSHIP','주일예배','','N'),('2019-12-22','WORSHIP','주일예배','','N'),('2019-12-29','WORSHIP','주일예배','','N');
/*!40000 ALTER TABLE `CHOIR_WORSHIP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MEETTING_DOC`
--

DROP TABLE IF EXISTS `MEETTING_DOC`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MEETTING_DOC` (
  `MEET_SEQ` int(11) NOT NULL AUTO_INCREMENT,
  `MEET_DT` varchar(10) NOT NULL,
  `MEET_TITLE` varchar(1000) NOT NULL,
  `MEET_CONTENTS` mediumtext NOT NULL,
  `REG_DT` date NOT NULL,
  `UPT_DT` date NOT NULL,
  `LOCK_YN` char(1) NOT NULL DEFAULT 'N',
  PRIMARY KEY (`MEET_SEQ`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MEETTING_DOC`
--

LOCK TABLES `MEETTING_DOC` WRITE;
/*!40000 ALTER TABLE `MEETTING_DOC` DISABLE KEYS */;
/*!40000 ALTER TABLE `MEETTING_DOC` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-01-19 13:59:13
