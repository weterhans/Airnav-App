-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 22, 2025 at 06:56 PM
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
  `role` varchar(50) NOT NULL DEFAULT 'teknisi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `fullname`, `email`, `password`, `signature_url`, `avatar_url`, `phone_number`, `role`) VALUES
(1, 'andiharper', 'Andi Julianto', 'andiharper@gmail.com', '$2b$10$u.XE6XPY9TTaW5WQiHm5xeb4qgBlcAqhsR8G5hLfYxF9JLjRaA0Pm', 'F:\\Project\\Airnav-App\\signatures\\signature-andiharper-1758555281061.png', 'F:\\Project\\Airnav-App\\avatars\\avatar-1-1758566739287.png', '08515680132323', 'teknisi'),
(2, 'joko', 'joko', 'joko@gmail.com', '$2b$10$vqPsDmeZvP94h.PCX5fZAehPRdvA6p0AzYBaVe3ODk5EZkBYUPa/i', 'F:\\Project\\Airnav-App\\signatures\\signature-joko-1758555426365.png', NULL, NULL, 'teknisi'),
(3, 'testt', 'testttt', 'test@gmail.com', '$2b$10$VqcebjA50knin02NbjrcOOWVUthgf1D3Z7DO5puHb1sJRQHXPjPTe', 'F:\\Project\\Airnav-App\\signatures\\signature-testt-1758559721603.png', NULL, NULL, 'teknisi'),
(4, 'qweqwe', 'wqeqewe', 'eqweqwe@adawd.com', '$2b$10$PVOBK5FyYP0w003KjwFyuu9vS9.Nl5PeO8r62VoFFIv8TYICJ/EB.', 'F:\\Project\\Airnav-App\\signatures\\signature-qweqwe-1758561928129.png', NULL, NULL, 'teknisi');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
