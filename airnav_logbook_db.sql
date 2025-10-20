-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 20, 2025 at 05:50 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `airnav_logbook_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `cnsd_activities`
--

CREATE TABLE `cnsd_activities` (
  `id` int NOT NULL,
  `kode` varchar(255) DEFAULT NULL,
  `dinas` varchar(50) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `waktu_mulai` time DEFAULT NULL,
  `waktu_selesai` time DEFAULT NULL,
  `alat` varchar(255) DEFAULT NULL,
  `permasalahan` text,
  `tindakan` text,
  `hasil` text,
  `status` varchar(50) DEFAULT NULL,
  `waktu_terputus` varchar(100) DEFAULT NULL,
  `teknisi` json DEFAULT NULL,
  `lampiran` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cnsd_activities`
--

INSERT INTO `cnsd_activities` (`id`, `kode`, `dinas`, `tanggal`, `waktu_mulai`, `waktu_selesai`, `alat`, `permasalahan`, `tindakan`, `hasil`, `status`, `waktu_terputus`, `teknisi`, `lampiran`, `created_at`, `updated_at`) VALUES
(1, 'KG-281109', 'Pagi', '2025-10-08', '09:34:00', '10:35:00', 'ADSB', 'short', 'dasdasd', '', 'Proses', NULL, '[\"Andi Julianto\", \"joko\"]', '[]', '2025-10-09 04:32:49', '2025-10-19 16:45:59'),
(2, 'KG-403463', 'Pagi', '2025-10-07', '08:50:00', '10:50:00', 'ASDAAS', 'SASFAFdadasasda', 'ADFASDA', 'ADSAD', 'Selesai', '1 jam', '[\"Andi Julianto\", \"joko\"]', '[\"F:\\\\Project\\\\Airnav-App\\\\attachments\\\\attachment-1760977787576-89306326_p0.png\"]', '2025-10-09 04:50:45', '2025-10-20 16:29:47'),
(3, 'KG-CNSD-688137', 'Malam', '2025-10-12', '20:02:00', '23:02:00', 'sfasawda', 'gfhfhdhdadsasdasddasdasadsasdsdadsa', 'hdfhdfg', 'dhdfhdfhdf', 'Selesai', '2 jam', '[\"joko\", \"Andi Julianto\"]', '[\"F:\\\\Project\\\\Airnav-App\\\\attachments\\\\attachment-1760893407484-89437506_p0.jpg\"]', '2025-10-14 16:02:59', '2025-10-19 17:03:27'),
(4, 'KG-CNSD-664718', 'Malam', '2025-10-13', '21:17:00', '23:17:00', 'asa', 'adafaf', 'dfafhehd', 'dhdfhdhd', 'Selesai', '1 jam', '[\"joko\", \"Andi Julianto\"]', '[\"F:\\\\Project\\\\Airnav-App\\\\attachments\\\\attachment-1760463861985-89437506_p0.jpg\", \"F:\\\\Project\\\\Airnav-App\\\\attachments\\\\attachment-1760463861989-Dark Queen.png\"]', '2025-10-14 16:18:47', '2025-10-14 17:44:21'),
(5, 'KG-CNSD-293396', 'Malam', '2025-10-13', '21:31:00', '23:31:00', 'fasfasf', 'afagasga', 'asfasfasgasg', 'faasgffasg', 'Selesai', '30 mnt', '[\"joko\"]', '[\"F:\\\\Project\\\\Airnav-App\\\\attachments\\\\attachment-1760460370536-89437506_p0.jpg\", \"F:\\\\Project\\\\Airnav-App\\\\attachments\\\\attachment-1760460370539-Dark Queen.png\"]', '2025-10-14 16:31:49', '2025-10-14 16:46:10'),
(6, 'KG-CNSD-724483', 'Malam', '2025-10-13', '11:59:00', '00:59:00', 'dgwsgs', 'aagsfg', 'gsagada', 'fasfa', 'Selesai', ' 1 jam', '[]', '[\"F:\\\\Project\\\\Airnav-App\\\\attachments\\\\attachment-1760464763761-89437506_p0.jpg\"]', '2025-10-14 17:59:23', '2025-10-19 17:03:08'),
(7, 'KG-CNSD-247004', 'Malam', '2025-10-17', '22:10:00', '23:10:00', 'gfafasfa', 'fara add', 'a fada fa ', 'daw dawda datgaa', 'Selesai', '1 jam', '[\"joko\"]', '[\"F:\\\\Project\\\\Airnav-App\\\\attachments\\\\attachment-1760890280023-GYRlMoT.png\"]', '2025-10-19 16:11:20', '2025-10-19 17:03:03'),
(8, 'KG-CNSD-890565', 'Malam', '2025-10-17', '19:55:00', '23:54:00', 'gasfa fa', ' asda as d asd', ' asdsa fgas df dasd asd a  das dasda', ' dag aas a', 'Selesai', '3 jam', '[\"Andi Julianto\"]', '[\"F:\\\\Project\\\\Airnav-App\\\\attachments\\\\attachment-1760892914326-j9pAs2N.jpg\"]', '2025-10-19 16:55:14', '2025-10-20 16:29:31');

-- --------------------------------------------------------

--
-- Table structure for table `cnsd_equipment`
--

CREATE TABLE `cnsd_equipment` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cnsd_equipment`
--

INSERT INTO `cnsd_equipment` (`id`, `name`) VALUES
(1, 'VHF GND Main (p) 118.9'),
(2, 'VHF GND Main (s) 119.15'),
(3, 'VHF ADC Main (p) 118.3'),
(4, 'VHF ADC Main (s) 118.1'),
(5, 'VHF APP Direc Main (p) 123.2'),
(6, 'VHF APP Direc Main (s) 124.5'),
(7, 'VHF APP West Main (p) 125.1'),
(8, 'VHF APP West Main (s) 123.55'),
(9, 'VHF APP East Main (p) 124.0'),
(10, 'VHF APP East Main (s) 122.85'),
(11, 'VHF CDU (p) 121.65'),
(12, 'VHF CDU (s) 121.85'),
(13, 'VHF-ER Makassar (p) 123.9'),
(14, 'VHF-ER Makassar (s) 125.9'),
(15, 'VHF-ER UPKN 134.1'),
(16, 'VHF-ER UBLI 125.7'),
(17, 'VHF ATIS 128.2'),
(18, 'VHF Emergency 121.5'),
(19, 'VHF GND Backup (p) 118.9'),
(20, 'VHF GND Backup (s) 119.15'),
(21, 'VHF ADC Backup (p) 118.3'),
(22, 'VHF ADC Backup (s) 118.1'),
(23, 'VHF APP Direc Backup (p) 123.2'),
(24, 'VHF APP West Backup (p) 125.1'),
(25, 'VHF APP East Main (p) 124.0'),
(26, 'Server Recorder A'),
(27, 'Server Recorder B'),
(28, 'PC Recorder Playback'),
(29, 'NTP Server & Gps'),
(30, 'ATIS Server A'),
(31, 'ATIS Server B'),
(32, 'PC Client Oprator'),
(33, 'Server AMSC A'),
(34, 'Server AMSC B'),
(35, 'Control & Spv console A'),
(36, 'Control & Spv console B'),
(37, 'Komputer ADPS'),
(38, 'BO 1 WARRZPZE'),
(39, 'BO 2 WARRYMYO'),
(40, 'METEO 1 WARRYMYF'),
(41, 'METEO 2 WARRYMYO'),
(42, 'INFORMASI WARRYIYX'),
(43, 'VCCS - GATE X2 - 01'),
(44, 'VCCS - GATE X2 - 02'),
(45, 'VCCS - GATE X2 - 03'),
(46, 'VCCS - GATE X2 - 04'),
(47, 'VCCS - GPIF 1-4'),
(48, 'VCCS - ERIF 1-10'),
(49, 'VCCS - BCA 1-5'),
(50, 'VCCS - BCB 1-9'),
(51, 'CWP1'),
(52, 'CWP2'),
(53, 'CWP3'),
(54, 'CWP4'),
(55, 'CWP5'),
(56, 'CWP6'),
(57, 'CWP7'),
(58, 'CWP8'),
(59, 'CWP9'),
(60, 'CWP10'),
(61, 'CWP11 (CDU)'),
(62, 'CWP12'),
(63, 'DVOR'),
(64, 'DME'),
(65, 'ILS - Localizer'),
(66, 'ILS - Glide Path'),
(67, 'ILS - T-DME'),
(68, 'MSSR - RMM 1 & 2'),
(69, 'MSSR - LCMS 1 & 2'),
(70, 'MSSR - SMP 1 & 2'),
(71, 'MSSR- RDP 1 & 2'),
(72, 'ADSB');

-- --------------------------------------------------------

--
-- Table structure for table `daily_cnsd_reports`
--

CREATE TABLE `daily_cnsd_reports` (
  `id` int NOT NULL,
  `report_id_custom` varchar(255) DEFAULT NULL,
  `dinas` varchar(50) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `jam` time DEFAULT NULL,
  `mantek` varchar(255) DEFAULT NULL,
  `acknowledge` varchar(255) DEFAULT NULL,
  `kode` varchar(255) DEFAULT NULL,
  `jadwal_dinas` text,
  `equipment_status` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `daily_cnsd_reports`
--

INSERT INTO `daily_cnsd_reports` (`id`, `report_id_custom`, `dinas`, `tanggal`, `jam`, `mantek`, `acknowledge`, `kode`, `jadwal_dinas`, `equipment_status`, `created_at`, `updated_at`) VALUES
(1, 'MALAM-08/10/2025-CNSD', 'MALAM', '2025-10-07', '23:46:00', 'Andi Julianto', 'joko', 'MALAM08102025CNSA', 'johan\nRosana\nAjul', '{\"vhfgndmainp1189\": {\"status\": \"GANGGUAN\", \"keterangan\": \" dsadasd asdas\"}}', '2025-10-08 16:47:22', '2025-10-20 16:33:09'),
(2, 'MALAM-08/10/2025-CNSD', 'MALAM', '2025-10-07', '00:08:00', '', '', 'MALAM08102025CNSA', '', '{\"vhfadcmainp1183\": {\"status\": \"GANGGUAN\", \"keterangan\": \"da sdasd\"}, \"vhfgndmainp1189\": {\"status\": \"GANGGUAN\", \"keterangan\": \"adadwadfadawda\"}}', '2025-10-08 17:08:42', '2025-10-20 16:32:46');

-- --------------------------------------------------------

--
-- Table structure for table `daily_tfp_reports`
--

CREATE TABLE `daily_tfp_reports` (
  `id` int NOT NULL,
  `report_id_custom` varchar(255) DEFAULT NULL,
  `dinas` varchar(50) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `jam` time DEFAULT NULL,
  `mantek` varchar(255) DEFAULT NULL,
  `acknowledge` varchar(255) DEFAULT NULL,
  `kode` varchar(255) DEFAULT NULL,
  `jadwal_dinas` text,
  `equipment_status` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `daily_tfp_reports`
--

INSERT INTO `daily_tfp_reports` (`id`, `report_id_custom`, `dinas`, `tanggal`, `jam`, `mantek`, `acknowledge`, `kode`, `jadwal_dinas`, `equipment_status`, `created_at`, `updated_at`) VALUES
(1, NULL, 'PAGI', '2025-10-09', '11:28:00', '', '', 'PAGI09102025TFPA', 'johan\nrosana\najul', '{\"cctv\": {\"status\": \"NORMAL\"}, \"powergp\": {\"status\": \"NORMAL\"}, \"powermm\": {\"status\": \"NORMAL\"}, \"powerrx\": {\"status\": \"NORMAL\"}, \"powertx\": {\"status\": \"NORMAL\"}, \"ruangrx\": {\"status\": \"NORMAL\"}, \"telepon\": {\"status\": \"NORMAL\"}, \"doorlock\": {\"status\": \"NORMAL\"}, \"gedungtx\": {\"status\": \"NORMAL\"}, \"poweraro\": {\"status\": \"NORMAL\"}, \"powerpia\": {\"status\": \"NORMAL\"}, \"ruangaro\": {\"status\": \"NORMAL\"}, \"ruangcbt\": {\"status\": \"NORMAL\"}, \"ruangk2s\": {\"status\": \"NORMAL\"}, \"ruangpia\": {\"status\": \"NORMAL\"}, \"acpackage\": {\"status\": \"NORMAL\"}, \"lifttower\": {\"status\": \"NORMAL\"}, \"poweramsc\": {\"status\": \"NORMAL\"}, \"powerdvor\": {\"status\": \"NORMAL\"}, \"powermssr\": {\"status\": \"NORMAL\"}, \"powervccs\": {\"status\": \"NORMAL\"}, \"powervsat\": {\"status\": \"NORMAL\"}, \"ruangamsc\": {\"status\": \"NORMAL\"}, \"sheltergp\": {\"status\": \"NORMAL\"}, \"sheltermm\": {\"status\": \"NORMAL\"}, \"exhaustfan\": {\"status\": \"NORMAL\"}, \"ups&genset\": {\"status\": \"NORMAL\"}, \"acsplitduct\": {\"status\": \"NORMAL\"}, \"acsplitwall\": {\"status\": \"NORMAL\"}, \"gedungradar\": {\"status\": \"NORMAL\"}, \"powerasmgcs\": {\"status\": \"NORMAL\"}, \"shelterdvor\": {\"status\": \"NORMAL\"}, \"obstaclelight\": {\"status\": \"NORMAL\"}, \"radiotrunking\": {\"status\": \"NORMAL\"}, \"ruanggm&sekgm\": {\"status\": \"NORMAL\"}, \"toiletltg,1,2\": {\"status\": \"NORMAL\"}, \"koridorltg,1,2\": {\"status\": \"NORMAL\"}, \"poweratcsystem\": {\"status\": \"NORMAL\"}, \"powerlocalizer\": {\"status\": \"NORMAL\"}, \"powerrecording\": {\"status\": \"NORMAL\"}, \"rotatingbeacon\": {\"status\": \"NORMAL\"}, \"acstandingfloor\": {\"status\": \"NORMAL\"}, \"ruangkontrolapp\": {\"status\": \"NORMAL\"}, \"gensetgedungdvor\": {\"status\": \"NORMAL\"}, \"ruangistrahatapp\": {\"status\": \"NORMAL\"}, \"ruangrapatoprasi\": {\"status\": \"NORMAL\"}, \"ruangrapatteknik\": {\"status\": \"NORMAL\"}, \"shelterlocalizer\": {\"status\": \"NORMAL\"}, \"gensetgedungradar\": {\"status\": \"NORMAL\"}, \"ruangequipmentaob\": {\"status\": \"NORMAL\"}, \"ruangistrahattower\": {\"status\": \"NORMAL\"}, \"ruangmanagerteknik\": {\"status\": \"NORMAL\"}, \"upsu1topazgedungtx\": {\"status\": \"NORMAL\"}, \"lampupjugedungradar\": {\"status\": \"NORMAL\"}, \"lampusorotpapannama\": {\"status\": \"NORMAL\"}, \"ruangstandbyteknisi\": {\"status\": \"NORMAL\"}, \"upsu2pillergedungtx\": {\"status\": \"NORMAL\"}, \"ruangkontrolatctower\": {\"status\": \"NORMAL\"}, \"ruangrapatmanagerial\": {\"status\": \"NORMAL\"}, \"ruangmanagerialoprasi\": {\"status\": \"NORMAL\"}, \"ruangmanagerialteknik\": {\"status\": \"NORMAL\"}, \"upsu3pillergedungradar\": {\"status\": \"NORMAL\"}, \"upsu6daleequipmentroom\": {\"status\": \"NORMAL\"}, \"upsu7daleequipmentroom\": {\"status\": \"NORMAL\"}, \"upsu8gamaequipmentroom\": {\"status\": \"NORMAL\"}, \"ruangadministrasi&keuangan\": {\"status\": \"NORMAL\"}, \"upsu9protectaequipmentroom\": {\"status\": \"NORMAL\"}}', '2025-10-09 04:29:15', '2025-10-09 04:29:15'),
(2, 'PAGI-09/10/2025-TFP', 'PAGI', '2025-10-09', '11:45:00', 'joko', 'Andi Julianto', 'PAGI09102025TFPA', 'ajul\nnopi', '{\"cctv\": {\"status\": \"NORMAL\"}, \"powergp\": {\"status\": \"NORMAL\"}, \"powermm\": {\"status\": \"NORMAL\"}, \"powerrx\": {\"status\": \"NORMAL\"}, \"powertx\": {\"status\": \"GANGGUAN\", \"keterangan\": \"meledak\"}, \"ruangrx\": {\"status\": \"NORMAL\"}, \"telepon\": {\"status\": \"NORMAL\"}, \"doorlock\": {\"status\": \"NORMAL\"}, \"gedungtx\": {\"status\": \"NORMAL\"}, \"poweraro\": {\"status\": \"NORMAL\"}, \"powerpia\": {\"status\": \"NORMAL\"}, \"ruangaro\": {\"status\": \"NORMAL\"}, \"ruangcbt\": {\"status\": \"NORMAL\"}, \"ruangk2s\": {\"status\": \"NORMAL\"}, \"ruangpia\": {\"status\": \"NORMAL\"}, \"acpackage\": {\"status\": \"NORMAL\"}, \"lifttower\": {\"status\": \"NORMAL\"}, \"poweramsc\": {\"status\": \"NORMAL\"}, \"powerdvor\": {\"status\": \"NORMAL\"}, \"powermssr\": {\"status\": \"NORMAL\"}, \"powervccs\": {\"status\": \"NORMAL\"}, \"powervsat\": {\"status\": \"NORMAL\"}, \"ruangamsc\": {\"status\": \"NORMAL\"}, \"sheltergp\": {\"status\": \"NORMAL\"}, \"sheltermm\": {\"status\": \"NORMAL\"}, \"exhaustfan\": {\"status\": \"NORMAL\"}, \"ups&genset\": {\"status\": \"NORMAL\"}, \"acsplitduct\": {\"status\": \"NORMAL\"}, \"acsplitwall\": {\"status\": \"NORMAL\"}, \"gedungradar\": {\"status\": \"NORMAL\"}, \"powerasmgcs\": {\"status\": \"NORMAL\"}, \"shelterdvor\": {\"status\": \"NORMAL\"}, \"obstaclelight\": {\"status\": \"NORMAL\"}, \"radiotrunking\": {\"status\": \"NORMAL\"}, \"ruanggm&sekgm\": {\"status\": \"NORMAL\"}, \"toiletltg,1,2\": {\"status\": \"NORMAL\"}, \"koridorltg,1,2\": {\"status\": \"NORMAL\"}, \"poweratcsystem\": {\"status\": \"NORMAL\"}, \"powerlocalizer\": {\"status\": \"NORMAL\"}, \"powerrecording\": {\"status\": \"NORMAL\"}, \"rotatingbeacon\": {\"status\": \"NORMAL\"}, \"acstandingfloor\": {\"status\": \"NORMAL\"}, \"ruangkontrolapp\": {\"status\": \"NORMAL\"}, \"gensetgedungdvor\": {\"status\": \"NORMAL\"}, \"ruangistrahatapp\": {\"status\": \"NORMAL\"}, \"ruangrapatoprasi\": {\"status\": \"NORMAL\"}, \"ruangrapatteknik\": {\"status\": \"NORMAL\"}, \"shelterlocalizer\": {\"status\": \"NORMAL\"}, \"gensetgedungradar\": {\"status\": \"NORMAL\"}, \"ruangequipmentaob\": {\"status\": \"NORMAL\"}, \"ruangistrahattower\": {\"status\": \"NORMAL\"}, \"ruangmanagerteknik\": {\"status\": \"NORMAL\"}, \"upsu1topazgedungtx\": {\"status\": \"NORMAL\"}, \"lampupjugedungradar\": {\"status\": \"NORMAL\"}, \"lampusorotpapannama\": {\"status\": \"NORMAL\"}, \"ruangstandbyteknisi\": {\"status\": \"NORMAL\"}, \"upsu2pillergedungtx\": {\"status\": \"NORMAL\"}, \"ruangkontrolatctower\": {\"status\": \"NORMAL\"}, \"ruangrapatmanagerial\": {\"status\": \"NORMAL\"}, \"ruangmanagerialoprasi\": {\"status\": \"NORMAL\"}, \"ruangmanagerialteknik\": {\"status\": \"NORMAL\"}, \"upsu3pillergedungradar\": {\"status\": \"NORMAL\"}, \"upsu6daleequipmentroom\": {\"status\": \"NORMAL\"}, \"upsu7daleequipmentroom\": {\"status\": \"NORMAL\"}, \"upsu8gamaequipmentroom\": {\"status\": \"NORMAL\"}, \"ruangadministrasi&keuangan\": {\"status\": \"NORMAL\"}, \"upsu9protectaequipmentroom\": {\"status\": \"NORMAL\"}}', '2025-10-09 04:45:49', '2025-10-09 04:45:49');

-- --------------------------------------------------------

--
-- Table structure for table `schedules_cnsd`
--

CREATE TABLE `schedules_cnsd` (
  `id` int NOT NULL,
  `schedule_id_custom` varchar(255) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `hari` varchar(50) DEFAULT NULL,
  `dinas` varchar(50) DEFAULT NULL,
  `teknisi_1` varchar(255) DEFAULT NULL,
  `teknisi_2` varchar(255) DEFAULT NULL,
  `teknisi_3` varchar(255) DEFAULT NULL,
  `teknisi_4` varchar(255) DEFAULT NULL,
  `teknisi_5` varchar(255) DEFAULT NULL,
  `teknisi_6` varchar(255) DEFAULT NULL,
  `kode` varchar(100) DEFAULT NULL,
  `grup` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'CNSD',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `schedules_cnsd`
--

INSERT INTO `schedules_cnsd` (`id`, `schedule_id_custom`, `tanggal`, `hari`, `dinas`, `teknisi_1`, `teknisi_2`, `teknisi_3`, `teknisi_4`, `teknisi_5`, `teknisi_6`, `kode`, `grup`, `created_at`, `updated_at`) VALUES
(1, 'MALAM-07/10/2025-CNSD', '2025-10-06', 'Senin', 'Malam', 'Andi Julianto', 'joko', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-07 15:45:02', '2025-10-07 16:21:00'),
(2, 'MALAM-07/10/2025-CNSD', '2025-10-07', 'Selasa', 'Malam', 'joko', 'Andi Julianto', 'joko', 'testttt', NULL, NULL, 'MALAM-07/10/2025-CNSD', 'CNSD', '2025-10-07 16:46:58', '2025-10-07 16:46:58'),
(3, 'MALAM-20/10/2025-CNSD', '2025-10-19', 'Minggu', 'Malam', 'Andi Julianto', 'joko', 'testttt', 'testttt', NULL, NULL, 'MALAM-20/10/2025-CNSD', 'CNSD', '2025-10-20 15:20:49', '2025-10-20 16:31:59');

-- --------------------------------------------------------

--
-- Table structure for table `schedules_tfp`
--

CREATE TABLE `schedules_tfp` (
  `id` int NOT NULL,
  `schedule_id_custom` varchar(255) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `hari` varchar(50) DEFAULT NULL,
  `dinas` varchar(50) DEFAULT NULL,
  `teknisi_1` varchar(255) DEFAULT NULL,
  `teknisi_2` varchar(255) DEFAULT NULL,
  `teknisi_3` varchar(255) DEFAULT NULL,
  `teknisi_4` varchar(255) DEFAULT NULL,
  `teknisi_5` varchar(255) DEFAULT NULL,
  `teknisi_6` varchar(255) DEFAULT NULL,
  `kode` varchar(100) DEFAULT NULL,
  `grup` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `schedules_tfp`
--

INSERT INTO `schedules_tfp` (`id`, `schedule_id_custom`, `tanggal`, `hari`, `dinas`, `teknisi_1`, `teknisi_2`, `teknisi_3`, `teknisi_4`, `teknisi_5`, `teknisi_6`, `kode`, `grup`, `created_at`, `updated_at`) VALUES
(1, 'MALAM-08/10/2025-TFP', '2025-10-08', 'Rabu', 'Malam', 'wqeqewe', NULL, NULL, NULL, NULL, NULL, 'MALAM-08/10/2025-TFP', 'TFP', '2025-10-08 19:49:20', '2025-10-08 19:49:20'),
(2, 'MALAM-20/10/2025-TFP', '2025-10-20', 'Senin', 'Malam', 'Andi Julianto', 'joko', 'testttt', NULL, NULL, NULL, 'MALAM-20/10/2025-TFP', 'TFP', '2025-10-20 16:50:36', '2025-10-20 16:50:36');

-- --------------------------------------------------------

--
-- Table structure for table `tfp_activities`
--

CREATE TABLE `tfp_activities` (
  `id` int NOT NULL,
  `kode` varchar(255) DEFAULT NULL,
  `dinas` varchar(50) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `waktu_mulai` time DEFAULT NULL,
  `waktu_selesai` time DEFAULT NULL,
  `alat` varchar(255) DEFAULT NULL,
  `permasalahan` text,
  `tindakan` text,
  `hasil` text,
  `status` varchar(50) DEFAULT NULL,
  `waktu_terputus` varchar(100) DEFAULT NULL,
  `teknisi` json DEFAULT NULL,
  `lampiran` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tfp_activities`
--

INSERT INTO `tfp_activities` (`id`, `kode`, `dinas`, `tanggal`, `waktu_mulai`, `waktu_selesai`, `alat`, `permasalahan`, `tindakan`, `hasil`, `status`, `waktu_terputus`, `teknisi`, `lampiran`, `created_at`, `updated_at`) VALUES
(1, 'KG-TFP-743401', 'Malam', '2025-10-08', '19:46:00', '21:45:00', 'Antena', 'aagwhgdhdhdh', 'hdfhdhdfkjd', 'dfhdfjdfjd', 'Selesai', '2 jam', '[\"Andi Julianto\", \"joko\"]', '[\"F:\\\\Project\\\\Airnav-App\\\\attachments\\\\attachment-tfp-1760894702088-89437506_p0.jpg\"]', '2025-10-09 15:47:43', '2025-10-19 17:25:02'),
(2, 'KG-TFP-703853', 'Malam', '2025-10-18', '10:25:00', '00:25:00', 'fsaf asfa sf', ' afas fasfs', 'f sfafasf asfas f', 'asf asfa  asfasf', 'Selesai', '1 jam 30 mnt', '[\"joko\", \"Andi Julianto\"]', '[\"F:\\\\Project\\\\Airnav-App\\\\attachments\\\\attachment-tfp-1760894736274-Dark Queen.png\", \"F:\\\\Project\\\\Airnav-App\\\\attachments\\\\attachment-tfp-1760894757594-uhdpaper.com-download-hd-wallpaper-1920x1080-658.0_a.jpg\", \"F:\\\\Project\\\\Airnav-App\\\\attachments\\\\attachment-tfp-1760894757598-wallpaperflare.com_wallpaper (1).jpg\", \"F:\\\\Project\\\\Airnav-App\\\\attachments\\\\attachment-tfp-1760894757644-wallpaperflare.com_wallpaper2.jpg\"]', '2025-10-19 17:25:36', '2025-10-19 17:25:57');

-- --------------------------------------------------------

--
-- Table structure for table `tfp_equipment`
--

CREATE TABLE `tfp_equipment` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tfp_equipment`
--

INSERT INTO `tfp_equipment` (`id`, `name`) VALUES
(1, 'Power Tx'),
(2, 'Power Rx'),
(3, 'Power Recording'),
(4, 'Power VCCS'),
(5, 'Power AMSC'),
(6, 'Power VSAT'),
(7, 'Power DVOR'),
(8, 'Power Localizer'),
(9, 'Power GP'),
(10, 'Power MM'),
(11, 'Power ARO'),
(12, 'Power MSSR'),
(13, 'Power ASMGCS'),
(14, 'Power ATC System'),
(15, 'Power PIA'),
(16, 'UPS & GENSET'),
(17, 'UPS.U1(TOPAZ): Gedung TX'),
(18, 'UPS.U3(PILLER): Gedung Radar'),
(19, 'UPS U6(DALE): Equipment Room'),
(20, 'UPS U7(DALE): Equipment Room'),
(21, 'UPS U8(GAMA): Equipment Room'),
(22, 'UPS U9(PROTECTA): Equipment Room'),
(23, 'UPS U2(PILLER): Gedung TX'),
(24, 'GENSET: Gedung Radar'),
(25, 'GENSET: Gedung DVOR'),
(26, 'AC Split Duct'),
(27, 'AC Standing Floor'),
(28, 'AC Package'),
(29, 'AC Split Wall'),
(30, 'Exhaust Fan'),
(31, 'Lift Tower'),
(32, 'Telepon'),
(33, 'Door lock'),
(34, 'CCTV'),
(35, 'Radio Trunking'),
(36, 'Ruang Kontrol ATC Tower'),
(37, 'Ruang Kontrol APP'),
(38, 'Ruang Equipment AOB'),
(39, 'Ruang Manager Teknik'),
(40, 'Ruang Managerial Teknik'),
(41, 'Ruang Standby Teknisi'),
(42, 'Ruang Istrahat APP'),
(43, 'Ruang Istrahat Tower'),
(44, 'Ruang PIA'),
(45, 'Ruang ARO'),
(46, 'Ruang AMSC'),
(47, 'Ruang CBT'),
(48, 'Ruang K2S'),
(49, 'Ruang Administrasi & Keuangan'),
(50, 'Ruang Managerial Oprasi'),
(51, 'Ruang GM & Sek GM'),
(52, 'Ruang Rapat Managerial'),
(53, 'Ruang Rapat Oprasi'),
(54, 'Ruang Rapat Teknik'),
(55, 'Koridor Lt.G,1,2'),
(56, 'Toilet Lt.G,1,2'),
(57, 'Obstacle Light'),
(58, 'Rotating Beacon'),
(59, 'Gedung Radar'),
(60, 'Gedung TX'),
(61, 'Ruang RX'),
(62, 'Shelter DVOR'),
(63, 'Shelter GP'),
(64, 'Shelter MM'),
(65, 'Shelter Localizer'),
(66, 'Lampu Sorot Papan Nama'),
(67, 'Lampu PJU Gedung Radar');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(255) NOT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `signature_url` text,
  `avatar_url` text,
  `phone_number` varchar(25) DEFAULT NULL,
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `fullname`, `email`, `password`, `signature_url`, `avatar_url`, `phone_number`, `role`) VALUES
(1, 'andiharper', 'Andi Julianto', 'andiharper@gmail.com', '$2b$10$u.XE6XPY9TTaW5WQiHm5xeb4qgBlcAqhsR8G5hLfYxF9JLjRaA0Pm', NULL, 'F:\\Project\\Airnav-App\\avatars\\avatar-1-1759424130061.png', '12512341241241', 'teknisi'),
(2, 'joko', 'joko', 'joko@gmail.com', '$2b$10$vqPsDmeZvP94h.PCX5fZAehPRdvA6p0AzYBaVe3ODk5EZkBYUPa/i', 'F:\\Project\\Airnav-App\\signatures\\signature-joko-1758555426365.png', NULL, NULL, 'teknisi'),
(3, 'testt', 'testttt', 'test@gmail.com', '$2b$10$VqcebjA50knin02NbjrcOOWVUthgf1D3Z7DO5puHb1sJRQHXPjPTe', 'F:\\Project\\Airnav-App\\signatures\\signature-testt-1758559721603.png', NULL, NULL, 'teknisi'),
(4, 'qweqwe', 'wqeqewe', 'eqweqwe@adawd.com', '$2b$10$PVOBK5FyYP0w003KjwFyuu9vS9.Nl5PeO8r62VoFFIv8TYICJ/EB.', 'F:\\Project\\Airnav-App\\signatures\\signature-qweqwe-1758561928129.png', NULL, NULL, 'teknisi'),
(6, 'harper', 'andijulian', 'andijuliant@gmail.com', '$2b$10$RrhsAEvMfSNTYBZPniQrb.TFrIofEHd3hDGRez3snxd/8xc3Y2bNa', 'F:\\Project\\Airnav-App\\signatures\\signature-harper-1759420227538.png', NULL, NULL, 'Supervisor'),
(7, 'andiwibowo', 'Andi WIbowo', 'andiwibowo@airnav.id', '$2b$10$F79Q0djEj/Wi7K/gvKyXeeXAS2X3iMEo4/73yUETOOrLxCDQbMxUi', 'F:\\Project\\Airnav-App\\signatures\\signature-andiwibowo-1759420342195.png', NULL, NULL, 'Manager');

-- --------------------------------------------------------

--
-- Table structure for table `workorders_cnsd`
--

CREATE TABLE `workorders_cnsd` (
  `id` int NOT NULL,
  `wo_id_custom` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tertuju` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `shift` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `shift_dinas_nama` text COLLATE utf8mb4_general_ci,
  `tanggal` date DEFAULT NULL,
  `jam_display` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deskripsi` text COLLATE utf8mb4_general_ci,
  `output` json DEFAULT NULL,
  `jam_mulai` time DEFAULT NULL,
  `jam_selesai` time DEFAULT NULL,
  `status_pelaksanaan` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `catatan_kendala` text COLLATE utf8mb4_general_ci,
  `usulan` text COLLATE utf8mb4_general_ci,
  `catatan_pemberi_tugas` text COLLATE utf8mb4_general_ci,
  `verify_manager` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `verify_supervisor` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `verify_pelaksana` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workorders_cnsd`
--

INSERT INTO `workorders_cnsd` (`id`, `wo_id_custom`, `tertuju`, `shift`, `shift_dinas_nama`, `tanggal`, `jam_display`, `deskripsi`, `output`, `jam_mulai`, `jam_selesai`, `status_pelaksanaan`, `catatan_kendala`, `usulan`, `catatan_pemberi_tugas`, `verify_manager`, `verify_supervisor`, `verify_pelaksana`) VALUES
(1, 'WO-CNSD-0001', 'CNSD', 'MALAM', '1. Andi Julianto\n2. joko\n3. testttt', '2025-10-20', '19.00 - 07.00', 'dasdasdasdsa', '[]', '21:25:00', '23:25:00', NULL, 'dasdadasda whatsupp dadsa dasda', 'asda dasdas das dsa dasd hello dadasda sd', 'dadasda da dasd asf asf', '2', '6', '11');

-- --------------------------------------------------------

--
-- Table structure for table `workorders_tfp`
--

CREATE TABLE `workorders_tfp` (
  `id` int NOT NULL,
  `wo_id_custom` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tertuju` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `shift` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `shift_dinas_nama` text COLLATE utf8mb4_general_ci,
  `tanggal` date DEFAULT NULL,
  `jam_display` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deskripsi` text COLLATE utf8mb4_general_ci,
  `output` json DEFAULT NULL,
  `jam_mulai` time DEFAULT NULL,
  `jam_selesai` time DEFAULT NULL,
  `status_pelaksanaan` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `catatan_kendala` text COLLATE utf8mb4_general_ci,
  `usulan` text COLLATE utf8mb4_general_ci,
  `catatan_pemberi_tugas` text COLLATE utf8mb4_general_ci,
  `verify_manager` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `verify_supervisor` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `verify_pelaksana` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workorders_tfp`
--

INSERT INTO `workorders_tfp` (`id`, `wo_id_custom`, `tertuju`, `shift`, `shift_dinas_nama`, `tanggal`, `jam_display`, `deskripsi`, `output`, `jam_mulai`, `jam_selesai`, `status_pelaksanaan`, `catatan_kendala`, `usulan`, `catatan_pemberi_tugas`, `verify_manager`, `verify_supervisor`, `verify_pelaksana`) VALUES
(1, 'WO-TFP-0001', 'TFP', 'MALAM', '1. Andi Julianto\n2. joko\n3. testttt', '2025-10-20', '19.00 - 07.00', 'd asdasdasdasda sad asd wa da da', '[]', '21:51:00', '23:51:00', 'selesai', 'da sdsada das da', 'sd asgagashg ahaha hello', 'ha sdhasdh aa fa sfafa sfa  afsa faf', '2', '6', '10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cnsd_activities`
--
ALTER TABLE `cnsd_activities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cnsd_equipment`
--
ALTER TABLE `cnsd_equipment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `daily_cnsd_reports`
--
ALTER TABLE `daily_cnsd_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `daily_tfp_reports`
--
ALTER TABLE `daily_tfp_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `schedules_cnsd`
--
ALTER TABLE `schedules_cnsd`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `schedules_tfp`
--
ALTER TABLE `schedules_tfp`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tfp_activities`
--
ALTER TABLE `tfp_activities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tfp_equipment`
--
ALTER TABLE `tfp_equipment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `workorders_cnsd`
--
ALTER TABLE `workorders_cnsd`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `workorders_tfp`
--
ALTER TABLE `workorders_tfp`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cnsd_activities`
--
ALTER TABLE `cnsd_activities`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `cnsd_equipment`
--
ALTER TABLE `cnsd_equipment`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `daily_cnsd_reports`
--
ALTER TABLE `daily_cnsd_reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `daily_tfp_reports`
--
ALTER TABLE `daily_tfp_reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `schedules_cnsd`
--
ALTER TABLE `schedules_cnsd`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `schedules_tfp`
--
ALTER TABLE `schedules_tfp`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tfp_activities`
--
ALTER TABLE `tfp_activities`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tfp_equipment`
--
ALTER TABLE `tfp_equipment`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `workorders_cnsd`
--
ALTER TABLE `workorders_cnsd`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `workorders_tfp`
--
ALTER TABLE `workorders_tfp`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
