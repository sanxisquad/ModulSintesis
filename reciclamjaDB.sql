-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Temps de generació: 12-05-2025 a les 12:33:06
-- Versió del servidor: 10.5.28-MariaDB
-- Versió de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de dades: `reciclamja`
--

-- --------------------------------------------------------

--
-- Estructura de la taula `accounts_customuser`
--

CREATE TABLE `accounts_customuser` (
  `id` bigint(20) NOT NULL,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `age` int(10) UNSIGNED DEFAULT NULL CHECK (`age` >= 0),
  `location` varchar(255) DEFAULT NULL,
  `role_id` bigint(20) DEFAULT NULL,
  `score` int(11) NOT NULL,
  `empresa_id` bigint(20) DEFAULT NULL,
  `CP` varchar(5) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `accounts_customuser`
--

INSERT INTO `accounts_customuser` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`, `age`, `location`, `role_id`, `score`, `empresa_id`, `CP`) VALUES
(1, 'pbkdf2_sha256$870000$3AtD09hoairfUpkBGcnzO7$ttRkYAQGkQf06KcXSeZtqu9HbSSHg83zXu9P7i4Y840=', '2025-03-27 09:29:14.730126', 1, 'sanxisquad', 'Marc', 'Sanchez Tasies', 'msancheztasies@gmail.com', 1, 1, '2025-03-06 11:00:40.000000', NULL, NULL, 1, 0, NULL, '25200'),
(3, 'pbkdf2_sha256$870000$rIFtzo2UvMbdkW1k4DcWIa$CLeqBAokvHb91aOEpqynXdYtslr6u5zJ5+o+vWHsAxg=', NULL, 0, 'ccsegarra', 'Juan', 'Magan', 'cc@lasegarra.cat', 0, 1, '2025-03-10 10:36:11.000000', 14, 'Cervera', 2, 0, 1, '25200'),
(4, 'pbkdf2_sha256$870000$DLCmGcrUe8Nm3jAE1RhG6T$fN4KDBozXxWUec6ZpdCXLOeHipg0VzQd6xRrM/Hvwsg=', NULL, 0, 'ccplaurgell', 'Pla', 'Urgell', 'ccplaurgell@plaurgell.cat', 0, 1, '2025-03-24 10:36:02.424597', 17, 'Mollerussa', 3, 0, 2, NULL),
(5, 'pbkdf2_sha256$870000$ZRg5ix5Ubrh6aq106eSZVs$+G0X3Uob0QaBYG++GHcOT/tu6iKHb1M1yL8rOSq4RMA=', NULL, 0, 'ccsegarra1', 'Marc', 'Test', 'ccsegarra@ccsegarra.cat', 0, 1, '2025-03-27 10:44:28.142022', 111, 'Cervera', 3, 0, 1, NULL),
(6, 'pbkdf2_sha256$870000$kfPorSJseqxdPwIdXYGauL$pkQPU/3k/+bO4uNBpVQeumRe8QFlHFoBUx3vOja4LS8=', NULL, 0, 'User', 'User', 'usuari', 'user@user.com', 0, 1, '2025-04-01 08:23:40.669253', 45, 'Cervera', 4, 0, NULL, '25200'),
(9, 'pbkdf2_sha256$870000$a3EEur1F0rvSvC1h04NjVg$uRtkSxZw/n4bP9cqMNFBPZaef1HGlf82Q1doLJpfieI=', NULL, 0, 'sanxisquadff', 'Ola', 'Ase', 'usfer@user.com', 0, 1, '2025-04-08 11:49:18.797366', 19, 'Cervera', 4, 0, NULL, '25200');

-- --------------------------------------------------------

--
-- Estructura de la taula `accounts_customuser_groups`
--

CREATE TABLE `accounts_customuser_groups` (
  `id` bigint(20) NOT NULL,
  `customuser_id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de la taula `accounts_customuser_user_permissions`
--

CREATE TABLE `accounts_customuser_user_permissions` (
  `id` bigint(20) NOT NULL,
  `customuser_id` bigint(20) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de la taula `accounts_empresa`
--

CREATE TABLE `accounts_empresa` (
  `id` bigint(20) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `NIF` varchar(9) NOT NULL,
  `direccio` varchar(255) NOT NULL,
  `telefon` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `CP` varchar(5) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `accounts_empresa`
--

INSERT INTO `accounts_empresa` (`id`, `nom`, `NIF`, `direccio`, `telefon`, `email`, `CP`) VALUES
(1, 'CC La Segarra', '99999999N', 'Cervera', '666666666', 'cc@lasegarra.cat', '25200'),
(2, 'CC Pla d\'Urgell', '12345678F', 'Mollerussa', '123456789', 'ccplaurgell@plaurgell.cat', '25230');

-- --------------------------------------------------------

--
-- Estructura de la taula `accounts_role`
--

CREATE TABLE `accounts_role` (
  `id` bigint(20) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `accounts_role`
--

INSERT INTO `accounts_role` (`id`, `name`) VALUES
(2, 'ADMIN'),
(3, 'GESTOR'),
(1, 'SUPERADMIN'),
(4, 'USER');

-- --------------------------------------------------------

--
-- Estructura de la taula `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de la taula `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de la taula `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add content type', 4, 'add_contenttype'),
(14, 'Can change content type', 4, 'change_contenttype'),
(15, 'Can delete content type', 4, 'delete_contenttype'),
(16, 'Can view content type', 4, 'view_contenttype'),
(17, 'Can add session', 5, 'add_session'),
(18, 'Can change session', 5, 'change_session'),
(19, 'Can delete session', 5, 'delete_session'),
(20, 'Can view session', 5, 'view_session'),
(21, 'Can add role', 6, 'add_role'),
(22, 'Can change role', 6, 'change_role'),
(23, 'Can delete role', 6, 'delete_role'),
(24, 'Can view role', 6, 'view_role'),
(25, 'Can add user', 7, 'add_customuser'),
(26, 'Can change user', 7, 'change_customuser'),
(27, 'Can delete user', 7, 'delete_customuser'),
(28, 'Can view user', 7, 'view_customuser'),
(29, 'Can add blacklisted token', 8, 'add_blacklistedtoken'),
(30, 'Can change blacklisted token', 8, 'change_blacklistedtoken'),
(31, 'Can delete blacklisted token', 8, 'delete_blacklistedtoken'),
(32, 'Can view blacklisted token', 8, 'view_blacklistedtoken'),
(33, 'Can add outstanding token', 9, 'add_outstandingtoken'),
(34, 'Can change outstanding token', 9, 'change_outstandingtoken'),
(35, 'Can delete outstanding token', 9, 'delete_outstandingtoken'),
(36, 'Can view outstanding token', 9, 'view_outstandingtoken'),
(37, 'Can add empresa', 10, 'add_empresa'),
(38, 'Can change empresa', 10, 'change_empresa'),
(39, 'Can delete empresa', 10, 'delete_empresa'),
(40, 'Can view empresa', 10, 'view_empresa'),
(41, 'Can add contenedor', 11, 'add_contenedor'),
(42, 'Can change contenedor', 11, 'change_contenedor'),
(43, 'Can delete contenedor', 11, 'delete_contenedor'),
(44, 'Can view contenedor', 11, 'view_contenedor'),
(45, 'Can add zones reciclatge', 12, 'add_zonesreciclatge'),
(46, 'Can change zones reciclatge', 12, 'change_zonesreciclatge'),
(47, 'Can delete zones reciclatge', 12, 'delete_zonesreciclatge'),
(48, 'Can view zones reciclatge', 12, 'view_zonesreciclatge'),
(49, 'Can add reporte contenedor', 13, 'add_reportecontenedor'),
(50, 'Can change reporte contenedor', 13, 'change_reportecontenedor'),
(51, 'Can delete reporte contenedor', 13, 'delete_reportecontenedor'),
(52, 'Can view reporte contenedor', 13, 'view_reportecontenedor'),
(53, 'Puede gestionar reportes', 13, 'can_manage_reports'),
(54, 'Can add notificacion', 14, 'add_notificacion'),
(55, 'Can change notificacion', 14, 'change_notificacion'),
(56, 'Can delete notificacion', 14, 'delete_notificacion'),
(57, 'Can view notificacion', 14, 'view_notificacion'),
(58, 'Can add historial contenedor', 15, 'add_historialcontenedor'),
(59, 'Can change historial contenedor', 15, 'change_historialcontenedor'),
(60, 'Can delete historial contenedor', 15, 'delete_historialcontenedor'),
(61, 'Can view historial contenedor', 15, 'view_historialcontenedor');

-- --------------------------------------------------------

--
-- Estructura de la taula `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) UNSIGNED NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `django_admin_log`
--

INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES
(1, '2025-03-06 11:39:00.501025', '1', 'ADMIN', 1, '[{\"added\": {}}]', 6, 1),
(2, '2025-03-06 11:39:08.665403', '2', 'USER', 1, '[{\"added\": {}}]', 6, 1),
(3, '2025-03-06 11:39:23.288966', '1', 'sanxisquad', 2, '[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Role\"]}}]', 7, 1),
(4, '2025-03-10 09:38:23.324919', '1', 'CC La Segarra', 1, '[{\"added\": {}}]', 10, 1),
(5, '2025-03-10 09:38:45.381200', '3', 'GESTOR', 1, '[{\"added\": {}}]', 6, 1),
(6, '2025-03-10 09:51:34.306201', '2', 'ccsegarra', 1, '[{\"added\": {}}]', 7, 1),
(7, '2025-03-10 10:31:32.512829', '2', 'ccsegarra', 2, '[]', 7, 1),
(8, '2025-03-10 10:36:02.354053', '2', 'ccsegarra', 2, '[]', 7, 1),
(9, '2025-03-10 10:36:09.224436', '2', 'ccsegarra', 3, '', 7, 1),
(10, '2025-03-10 10:36:41.835955', '3', 'ccsegarra', 1, '[{\"added\": {}}]', 7, 1),
(11, '2025-03-10 10:44:15.316148', '3', 'ccsegarra', 2, '[{\"changed\": {\"fields\": [\"password\"]}}]', 7, 1),
(12, '2025-03-11 07:59:39.379094', '5', 'Zona de reciclaje: Deixalleria - Ciutat: Cervera', 1, '[{\"added\": {}}]', 12, 1),
(13, '2025-03-14 10:36:59.344845', '6', 'Zona de reciclaje: Deixalleria de Sant Guim - Ciutat: Sant Guim', 1, '[{\"added\": {}}]', 12, 1),
(14, '2025-03-17 11:53:01.756740', '4', 'Contenedor a Sense zona - Estat: mig - Tipo: plàstic - Ciutat: Granyena', 2, '[{\"changed\": {\"fields\": [\"Latitud\", \"Longitud\"]}}]', 11, 1),
(15, '2025-03-24 10:35:15.384740', '2', 'CC Pla d\'Urgell', 1, '[{\"added\": {}}]', 10, 1),
(16, '2025-03-24 10:36:03.134910', '4', 'ccplaurgell', 1, '[{\"added\": {}}]', 7, 1),
(17, '2025-03-25 10:14:50.417945', '1', 'CC La Segarra', 2, '[{\"changed\": {\"fields\": [\"CP\"]}}]', 10, 1),
(18, '2025-03-25 10:15:06.249678', '2', 'CC Pla d\'Urgell', 2, '[{\"changed\": {\"fields\": [\"CP\"]}}]', 10, 1),
(19, '2025-03-27 07:52:06.774820', '1', 'sanxisquad', 2, '[{\"changed\": {\"fields\": [\"password\"]}}]', 7, 1),
(20, '2025-03-27 09:07:03.350791', '245', 'SUPERADMIN', 1, '[{\"added\": {}}]', 6, 1),
(21, '2025-03-27 10:44:28.909066', '5', 'ccsegarra1', 1, '[{\"added\": {}}]', 7, 1),
(22, '2025-03-27 11:49:12.184763', '3', 'ccsegarra', 2, '[{\"changed\": {\"fields\": [\"Role\"]}}]', 7, 1),
(23, '2025-04-01 08:23:41.715126', '6', 'User', 1, '[{\"added\": {}}]', 7, 1);

-- --------------------------------------------------------

--
-- Estructura de la taula `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(7, 'accounts', 'customuser'),
(10, 'accounts', 'empresa'),
(6, 'accounts', 'role'),
(1, 'admin', 'logentry'),
(3, 'auth', 'group'),
(2, 'auth', 'permission'),
(4, 'contenttypes', 'contenttype'),
(5, 'sessions', 'session'),
(8, 'token_blacklist', 'blacklistedtoken'),
(9, 'token_blacklist', 'outstandingtoken'),
(11, 'zonesreciclatge', 'contenedor'),
(15, 'zonesreciclatge', 'historialcontenedor'),
(14, 'zonesreciclatge', 'notificacion'),
(13, 'zonesreciclatge', 'reportecontenedor'),
(12, 'zonesreciclatge', 'zonesreciclatge');

-- --------------------------------------------------------

--
-- Estructura de la taula `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2025-03-06 10:59:33.857651'),
(2, 'contenttypes', '0002_remove_content_type_name', '2025-03-06 10:59:33.887872'),
(3, 'auth', '0001_initial', '2025-03-06 10:59:34.021409'),
(4, 'auth', '0002_alter_permission_name_max_length', '2025-03-06 10:59:34.049963'),
(5, 'auth', '0003_alter_user_email_max_length', '2025-03-06 10:59:34.054962'),
(6, 'auth', '0004_alter_user_username_opts', '2025-03-06 10:59:34.058964'),
(7, 'auth', '0005_alter_user_last_login_null', '2025-03-06 10:59:34.062961'),
(8, 'auth', '0006_require_contenttypes_0002', '2025-03-06 10:59:34.063878'),
(9, 'auth', '0007_alter_validators_add_error_messages', '2025-03-06 10:59:34.067888'),
(10, 'auth', '0008_alter_user_username_max_length', '2025-03-06 10:59:34.071887'),
(11, 'auth', '0009_alter_user_last_name_max_length', '2025-03-06 10:59:34.075886'),
(12, 'auth', '0010_alter_group_name_max_length', '2025-03-06 10:59:34.090954'),
(13, 'auth', '0011_update_proxy_permissions', '2025-03-06 10:59:34.095907'),
(14, 'auth', '0012_alter_user_first_name_max_length', '2025-03-06 10:59:34.098912'),
(15, 'accounts', '0001_initial', '2025-03-06 10:59:34.315835'),
(16, 'admin', '0001_initial', '2025-03-06 10:59:34.405000'),
(17, 'admin', '0002_logentry_remove_auto_add', '2025-03-06 10:59:34.410997'),
(18, 'admin', '0003_logentry_add_action_flag_choices', '2025-03-06 10:59:34.419997'),
(19, 'sessions', '0001_initial', '2025-03-06 10:59:34.440382'),
(20, 'accounts', '0002_customuser_score', '2025-03-06 11:22:47.141274'),
(21, 'token_blacklist', '0001_initial', '2025-03-07 10:42:19.934662'),
(22, 'token_blacklist', '0002_outstandingtoken_jti_hex', '2025-03-07 10:42:19.948668'),
(23, 'token_blacklist', '0003_auto_20171017_2007', '2025-03-07 10:42:19.962178'),
(24, 'token_blacklist', '0004_auto_20171017_2013', '2025-03-07 10:42:19.993179'),
(25, 'token_blacklist', '0005_remove_outstandingtoken_jti', '2025-03-07 10:42:20.010181'),
(26, 'token_blacklist', '0006_auto_20171017_2113', '2025-03-07 10:42:20.023195'),
(27, 'token_blacklist', '0007_auto_20171017_2214', '2025-03-07 10:42:20.390782'),
(28, 'token_blacklist', '0008_migrate_to_bigautofield', '2025-03-07 10:42:20.555584'),
(29, 'token_blacklist', '0010_fix_migrate_to_bigautofield', '2025-03-07 10:42:20.566073'),
(30, 'token_blacklist', '0011_linearizes_history', '2025-03-07 10:42:20.569139'),
(31, 'token_blacklist', '0012_alter_outstandingtoken_user', '2025-03-07 10:42:20.577170'),
(32, 'accounts', '0003_empresa_customuser_empresa', '2025-03-07 11:49:52.801289'),
(33, 'zonesreciclatge', '0001_initial', '2025-03-07 11:52:17.779151'),
(34, 'zonesreciclatge', '0002_contenedor_cod', '2025-03-11 11:10:42.682362'),
(35, 'accounts', '0004_customuser_cp', '2025-03-14 12:24:34.304365'),
(36, 'zonesreciclatge', '0003_alter_contenedor_tipus', '2025-03-14 12:24:34.309360'),
(37, 'accounts', '0005_empresa_cp', '2025-03-25 10:10:53.095728'),
(38, 'accounts', '0006_alter_customuser_email_alter_customuser_empresa', '2025-04-08 10:19:46.727354'),
(39, 'zonesreciclatge', '0004_contenedor_alerta_contenedor_fecha_ultimo_vaciado_and_more', '2025-05-05 11:02:39.889859'),
(40, 'zonesreciclatge', '0005_reportecontenedor_empresa', '2025-05-06 10:08:05.287709');

-- --------------------------------------------------------

--
-- Estructura de la taula `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('1npng0py0tgdh12hsxedlojvi0182mrk', '.eJxVjEEOwiAQRe_C2hCgUKhL956BzAyDVA0kpV0Z765NutDtf-_9l4iwrSVunZc4J3EWWpx-NwR6cN1BukO9NUmtrsuMclfkQbu8tsTPy-H-HRTo5Vuz9kwWB6-sZT-SH3h0zhhrNVA2gTLkASwnE5xShNlhCAooTJh0nrx4fwDkFTgz:1tracJ:2Q5KCdhnkb9zIFq0ImwqaeYwycNPE8k0E0ZiHA8VtYA', '2025-03-24 10:44:15.323173'),
('o4fjilr64o3lc5xpkiamzx8wfiwtsy08', '.eJxVjEsOAiEQBe_C2hB-Adqle89AoGlk1EAyzKyMd1eSWej2VdV7sRD3rYZ90BqWzM5MstPvliI-qE2Q77HdOsfetnVJfCr8oINfe6bn5XD_DmocddaklfEWQDiFxjudHHhKqGSxXlJJYCwk0CiEAvw6HnMEmQUYpwoV9v4Ayhg3lg:1txjY2:0p0fINEIBAo21yEmocnpePcLFH1WSzm0uaTfhRvhpIw', '2025-04-10 09:29:14.731730'),
('z9vrjghhtx5g8y22uhwda7nb2cwzyagy', '.eJxVjEEOwiAQRe_C2hCgUKhL956BzAyDVA0kpV0Z765NutDtf-_9l4iwrSVunZc4J3EWWpx-NwR6cN1BukO9NUmtrsuMclfkQbu8tsTPy-H-HRTo5Vuz9kwWB6-sZT-SH3h0zhhrNVA2gTLkASwnE5xShNlhCAooTJh0nrx4fwDkFTgz:1trZUV:Cv8KALczf10KO0kcBmm39o9XsmJGO2tYmJpfrP3-kfQ', '2025-03-24 09:32:07.609924');

-- --------------------------------------------------------

--
-- Estructura de la taula `token_blacklist_blacklistedtoken`
--

CREATE TABLE `token_blacklist_blacklistedtoken` (
  `id` bigint(20) NOT NULL,
  `blacklisted_at` datetime(6) NOT NULL,
  `token_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `token_blacklist_blacklistedtoken`
--

INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES
(1, '2025-03-07 10:42:43.251256', 1),
(2, '2025-03-07 10:42:55.745557', 2),
(3, '2025-03-07 10:45:47.312641', 3),
(4, '2025-03-10 09:53:08.346106', 8),
(5, '2025-03-10 10:08:38.387811', 10),
(6, '2025-03-10 10:58:02.645867', 13),
(7, '2025-03-10 10:58:14.879359', 14),
(8, '2025-03-10 11:01:34.300181', 15),
(9, '2025-03-10 11:01:41.340087', 16),
(10, '2025-03-14 09:07:08.081200', 31),
(11, '2025-03-24 10:34:01.151360', 34),
(12, '2025-03-27 07:51:17.576585', 37),
(13, '2025-03-27 08:03:23.266105', 45),
(14, '2025-03-27 08:06:53.923383', 47),
(15, '2025-03-27 08:16:32.452775', 48),
(16, '2025-03-27 08:31:09.085037', 52),
(17, '2025-03-27 08:32:13.778550', 54),
(18, '2025-03-27 08:42:10.323886', 55),
(19, '2025-03-27 08:42:52.352625', 56),
(20, '2025-03-27 08:48:35.578829', 57),
(21, '2025-03-27 08:55:06.165935', 58),
(22, '2025-03-27 08:56:08.149603', 59),
(23, '2025-03-27 08:56:27.757586', 60),
(24, '2025-03-27 10:22:33.542962', 62),
(25, '2025-03-27 10:45:15.087300', 63),
(26, '2025-03-27 10:47:02.204806', 64),
(27, '2025-03-27 10:55:15.703543', 66),
(28, '2025-03-27 11:16:03.961039', 67),
(29, '2025-03-27 11:48:39.967290', 68),
(30, '2025-04-01 08:21:30.359175', 71),
(31, '2025-04-01 09:40:21.587779', 72),
(32, '2025-04-01 09:40:52.383458', 73),
(33, '2025-04-01 09:48:43.616917', 74),
(34, '2025-04-01 09:55:54.486720', 75),
(35, '2025-04-01 10:45:49.469305', 76),
(36, '2025-04-01 10:56:31.998434', 77),
(37, '2025-04-01 11:16:26.626820', 78),
(38, '2025-04-02 18:21:56.150707', 82),
(39, '2025-04-02 18:23:29.158040', 83),
(40, '2025-04-02 19:22:25.336854', 84),
(41, '2025-04-03 06:13:14.313385', 86),
(42, '2025-04-03 06:14:08.604902', 87),
(43, '2025-04-03 06:14:33.540034', 88),
(44, '2025-04-03 06:21:36.872418', 89),
(45, '2025-04-03 06:24:02.838191', 90),
(46, '2025-04-03 06:30:25.889213', 91),
(47, '2025-04-03 06:34:46.579694', 93),
(48, '2025-04-03 06:39:56.910266', 94),
(49, '2025-04-03 06:40:32.503514', 95),
(50, '2025-04-03 06:49:06.994827', 96),
(51, '2025-04-03 06:49:18.102758', 97),
(52, '2025-04-03 06:49:56.946144', 98),
(53, '2025-04-03 06:52:52.412507', 99),
(54, '2025-04-03 06:53:03.982883', 100),
(55, '2025-04-03 07:25:44.574350', 101),
(56, '2025-04-03 07:34:41.713877', 102),
(57, '2025-04-03 07:35:01.670215', 103),
(58, '2025-04-03 08:13:32.180539', 104),
(59, '2025-04-03 09:10:37.865789', 105),
(60, '2025-04-03 09:58:38.835974', 106),
(61, '2025-04-04 07:39:57.992377', 109),
(62, '2025-04-04 07:40:50.904545', 110),
(63, '2025-04-04 09:46:36.823588', 112),
(64, '2025-04-04 09:46:52.657156', 113),
(65, '2025-04-07 09:18:48.746869', 116),
(66, '2025-04-08 07:25:47.563716', 118),
(67, '2025-04-08 07:45:00.120559', 119),
(68, '2025-04-08 08:08:20.081704', 120),
(69, '2025-04-22 06:56:45.764101', 121),
(70, '2025-04-22 06:57:43.288444', 122),
(71, '2025-04-24 10:16:57.243706', 126),
(72, '2025-04-28 10:23:32.260117', 130),
(73, '2025-05-08 09:25:31.986008', 136),
(74, '2025-05-08 09:26:35.483997', 137),
(75, '2025-05-09 09:22:01.944439', 138);

-- --------------------------------------------------------

--
-- Estructura de la taula `token_blacklist_outstandingtoken`
--

CREATE TABLE `token_blacklist_outstandingtoken` (
  `id` bigint(20) NOT NULL,
  `token` longtext NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `expires_at` datetime(6) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `jti` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `token_blacklist_outstandingtoken`
--

INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES
(1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTk0NTMyNSwiaWF0IjoxNzQxMzQwNTI1LCJqdGkiOiJmM2ZjNjVlMDc4MTg0Y2M0ODk2N2E1MTBjMjAzNzcxMSIsInVzZXJfaWQiOjF9.mSSSzZ6xbcDWhO4vl95up9hA5EGpguMjSfsblUUl1v4', '2025-03-07 10:42:43.246963', '2025-03-14 09:42:05.000000', 1, 'f3fc65e078184cc48967a510c2037711'),
(2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTk0ODk3MiwiaWF0IjoxNzQxMzQ0MTcyLCJqdGkiOiIwNTI0M2Y5MmRiYjg0MjE1YWE0YjFlYzhmY2M3OGRhMCIsInVzZXJfaWQiOjF9.Wa8ZW_XvpDNQhPvfAUXvJ4PlNHq71HZnmqQ4ks0VK3I', '2025-03-07 10:42:52.647831', '2025-03-14 10:42:52.000000', 1, '05243f92dbb84215aa4b1ec8fcc78da0'),
(3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTk0OTE0NiwiaWF0IjoxNzQxMzQ0MzQ2LCJqdGkiOiI0Mjg2MGY5NTQ0NzU0ZDdkODBmNmE3MzI2NTUwYTJlYyIsInVzZXJfaWQiOjF9.vtpyc0hq5URSIHEvWgGrAkgDhvgTJ9DsKmOlKs4bv2A', '2025-03-07 10:45:46.179263', '2025-03-14 10:45:46.000000', 1, '42860f9544754d7d80f6a7326550a2ec'),
(4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTk0OTE1MSwiaWF0IjoxNzQxMzQ0MzUxLCJqdGkiOiJlYjhmNGQ2YTUxMmM0ZTFhODY4NDQwZGM3NTM3NjdmYSIsInVzZXJfaWQiOjF9.VZS40PS9dxLtjEe9PvNzekNBv8KvHNN2LMOcsrTnFHc', '2025-03-07 10:45:51.559885', '2025-03-14 10:45:51.000000', 1, 'eb8f4d6a512c4e1a868440dc753767fa'),
(5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTk0OTMwOCwiaWF0IjoxNzQxMzQ0NTA4LCJqdGkiOiIxZGQ4NWRhOTI5MjM0MzdkYjBkYTJmOTA2OGRjZDc1NCIsInVzZXJfaWQiOjF9.3Fuxy7Ht-JnsW7Jp1Hf5wgyK3S_WM8U1CNNyqsfAKM4', '2025-03-07 10:48:28.633284', '2025-03-14 10:48:28.000000', 1, '1dd85da92923437db0da2f9068dcd754'),
(6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTk0OTMxNywiaWF0IjoxNzQxMzQ0NTE3LCJqdGkiOiIxZjhhOTY0Mzk2NTQ0MmMyODdjMDYzY2ZmNzNlMzJjNyIsInVzZXJfaWQiOjF9.jbGfXwX7kYnshNMAXAc0kkaQuBeQw47JGQHHTPLq-Uk', '2025-03-07 10:48:37.413585', '2025-03-14 10:48:37.000000', 1, '1f8a9643965442c287c063cff73e32c7'),
(7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTk1NDM2NSwiaWF0IjoxNzQxMzQ5NTY1LCJqdGkiOiIzOTBkYTc4MTNmOGE0OWU1YjJkMjBlYTQ2MjQzMjFkOSIsInVzZXJfaWQiOjF9.-qmRkunAJ-nFo6q02ZlxpXu4ie4oRpu-lZXOl5ErrdY', '2025-03-07 12:12:45.464708', '2025-03-14 12:12:45.000000', 1, '390da7813f8a49e5b2d20ea4624321d9'),
(8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MTk1NTM0OSwiaWF0IjoxNzQxMzUwNTQ5LCJqdGkiOiJhOGYwMDg4NTg3MGU0NDg2OGViN2MzYWU3OWU1NjEzYyIsInVzZXJfaWQiOjF9.JqWr_9a3LXPkheeb85ex-DVkj4GffAYUZNv0eJBa3kc', '2025-03-07 12:29:09.947263', '2025-03-14 12:29:09.000000', 1, 'a8f00885870e44868eb7c3ae79e5613c'),
(9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjIwNTEwNiwiaWF0IjoxNzQxNjAwMzA2LCJqdGkiOiI2ZWZlMmQ0ZDFiNzQ0YjAwYjRjNWRmODI4ZmNjMWZmNiIsInVzZXJfaWQiOjF9._Hg8DbhKGtefBCdg_T69X1Zj17L7NPJTW3iHCd2sMn8', '2025-03-10 09:51:46.593042', '2025-03-17 09:51:46.000000', 1, '6efe2d4d1b744b00b4c5df828fcc1ff6'),
(10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjIwNjExNCwiaWF0IjoxNzQxNjAxMzE0LCJqdGkiOiI5ZmM3NWI1ZDJmMWE0MTkxYTYxNWM5NzM0OGU2ZGU3MyIsInVzZXJfaWQiOjF9.xNwSkPgWanm4oidP6uWZEEqe7JXmENPv0xP85ZxOViE', '2025-03-10 10:08:34.818163', '2025-03-17 10:08:34.000000', 1, '9fc75b5d2f1a4191a615c97348e6de73'),
(11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjIwNzEyNiwiaWF0IjoxNzQxNjAyMzI2LCJqdGkiOiI0YTU0M2ZkZmMyOTI0MTAyODEzZWI2ZTRhZGExOGU1MCIsInVzZXJfaWQiOjF9.1q5MxPt_MRzzpmSQAkugW396QKfeIpFIV3v0iqTijSI', '2025-03-10 10:25:26.795499', '2025-03-17 10:25:26.000000', 1, '4a543fdfc2924102813eb6e4ada18e50'),
(12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjIwODI3NSwiaWF0IjoxNzQxNjAzNDc1LCJqdGkiOiI4NGZmYTU4MjI3MjA0OTA1YWY4YWJjODE4ZDQ5NzgwZCIsInVzZXJfaWQiOjN9.CU_CUpf0VgdR74ediL6-ih9a6Qq8t1rBcoKIkdnRMJA', '2025-03-10 10:44:35.113638', '2025-03-17 10:44:35.000000', 3, '84ffa58227204905af8abc818d49780d'),
(13, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjIwODQzOCwiaWF0IjoxNzQxNjAzNjM4LCJqdGkiOiI0MzZiNjM0ZjBhOTE0MDdjOTkzZGIxYjZkNGQwZTIzYiIsInVzZXJfaWQiOjF9.rIXOMrbmANL2oCwy1GnoLQSoQLjWq6VF0bt5Sw2kuXg', '2025-03-10 10:47:18.433975', '2025-03-17 10:47:18.000000', 1, '436b634f0a91407c993db1b6d4d0e23b'),
(14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjIwOTA5MSwiaWF0IjoxNzQxNjA0MjkxLCJqdGkiOiI4MjRjYTU5ODU4ZDU0NGY4ODM5MmY0OTRkOTExNjE3YiIsInVzZXJfaWQiOjN9.LTwvvhPDovGVUnUbzztpXGBMT-EaYiOOI5s4COsO6lE', '2025-03-10 10:58:11.174358', '2025-03-17 10:58:11.000000', 3, '824ca59858d544f88392f494d911617b'),
(15, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjIwOTExMSwiaWF0IjoxNzQxNjA0MzExLCJqdGkiOiJiYTBkODE5NzI3MmI0ZDUzOWMxYzdjODA3YzNjNGU5NiIsInVzZXJfaWQiOjN9.GLySqfGz1r4D6qYi4khhKgXsWmKPq3s2--bgesk9-BE', '2025-03-10 10:58:31.427162', '2025-03-17 10:58:31.000000', 3, 'ba0d8197272b4d539c1c7c807c3c4e96'),
(16, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjIwOTI5OSwiaWF0IjoxNzQxNjA0NDk5LCJqdGkiOiI3YmUxODg2ZTZlMTc0ZjUzYjMzMTVkZjg0ZGRlM2M5YyIsInVzZXJfaWQiOjF9.3BgKGj_TRWRtnl9WPDK5t7h6S-f8iTA00OL_6uvbeD4', '2025-03-10 11:01:39.252921', '2025-03-17 11:01:39.000000', 1, '7be1886e6e174f53b3315df84dde3c9c'),
(17, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjIwOTMxOCwiaWF0IjoxNzQxNjA0NTE4LCJqdGkiOiI0YjdlNDVhY2ZiY2U0YWFmOWI5MmJlOWIxYzYzNDYwMCIsInVzZXJfaWQiOjN9.BgrSkRAkumwqNbhAcj6dB0PS6kMlnGMROQJ14UbnL3A', '2025-03-10 11:01:58.977968', '2025-03-17 11:01:58.000000', 3, '4b7e45acfbce4aaf9b92be9b1c634600'),
(18, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjIxMzY5NiwiaWF0IjoxNzQxNjA4ODk2LCJqdGkiOiIyZmEyNzk5Mzc5OGI0OTg5YTNhZWI1NmUxOTZhZDcwMCIsInVzZXJfaWQiOjN9.V-p7pyf0Y2Dqe53ko1WWj0KlYFotIj3tCi43jsSZBD0', '2025-03-10 12:14:56.701331', '2025-03-17 12:14:56.000000', 3, '2fa27993798b4989a3aeb56e196ad700'),
(19, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjI4MjI0MCwiaWF0IjoxNzQxNjc3NDQwLCJqdGkiOiI1NmQ5MWU3N2QwNDI0OWY0OWQyNWY3ZDE3YTUxMjVmNiIsInVzZXJfaWQiOjN9.PE62ip7uRp-RfXFymIwzr8Hp0R2x0Raiw31D0wyz8Ns', '2025-03-11 07:17:20.786373', '2025-03-18 07:17:20.000000', 3, '56d91e77d04249f49d25f7d17a5125f6'),
(20, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjI4NTM4MiwiaWF0IjoxNzQxNjgwNTgyLCJqdGkiOiIwY2ExY2JjODY1Mjg0ODgwYTgzYTdlZmVhNTYyNTg1ZSIsInVzZXJfaWQiOjN9.GhoL9FfAdikTuQ6ZHWPn7RRIdWfXDETqmaR30u4dhvM', '2025-03-11 08:09:42.548606', '2025-03-18 08:09:42.000000', 3, '0ca1cbc865284880a83a7efea562585e'),
(21, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjI4NjYwOCwiaWF0IjoxNzQxNjgxODA4LCJqdGkiOiIxNTdhZDM5NWRiMDQ0NTcxODEwOGM1MDk0NTYwMjBhYSIsInVzZXJfaWQiOjN9.NRlUqdxxYitXzpXlUHg9O9ikfni_WCTYt6DG1Lm0Xy8', '2025-03-11 08:30:08.429509', '2025-03-18 08:30:08.000000', 3, '157ad395db0445718108c509456020aa'),
(22, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjI4ODA0MywiaWF0IjoxNzQxNjgzMjQzLCJqdGkiOiI3NDExZjUzYTljZDM0MGY3ODAzNmM4NTI1NGI0ZmNhMyIsInVzZXJfaWQiOjN9.PtAGcIW1FKrMUko-KxdJIDxyBgCIdyfuPHCIe-ov8nE', '2025-03-11 08:54:03.996195', '2025-03-18 08:54:03.000000', 3, '7411f53a9cd340f78036c85254b4fca3'),
(23, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjI4OTA1OSwiaWF0IjoxNzQxNjg0MjU5LCJqdGkiOiI4MWU4MDg3YmE3ZDI0ZGVjOTkwNDcyMzg3NGZjYzY4NyIsInVzZXJfaWQiOjN9.dXhLRmMbD37lmYhwPwVvx7AhJrR7vslAAvM0ZyzGpFk', '2025-03-11 09:10:59.563965', '2025-03-18 09:10:59.000000', 3, '81e8087ba7d24dec9904723874fcc687'),
(24, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjI5NTgxOCwiaWF0IjoxNzQxNjkxMDE4LCJqdGkiOiJlM2IzNzhmYjk2YjY0ZTdjOWY5MTJhMTRmOGZkYjI0YyIsInVzZXJfaWQiOjN9.12P5FnO3GvE1WOKmako2PIm6SeYfmYulCFjlHxzq61w', '2025-03-11 11:03:38.625441', '2025-03-18 11:03:38.000000', 3, 'e3b378fb96b64e7c9f912a14f8fdb24c'),
(25, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjI5NjU5OCwiaWF0IjoxNzQxNjkxNzk4LCJqdGkiOiI0OGQ1MDAxN2VmYzU0ODdkOTFhZWZkODk2MGNmZmViNyIsInVzZXJfaWQiOjN9.cli62kGJkIgQMhZkH7NjSMpAAcpLHHY8C7Mii6HT6Do', '2025-03-11 11:16:38.186370', '2025-03-18 11:16:38.000000', 3, '48d50017efc5487d91aefd8960cffeb7'),
(26, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjI5NzYzNiwiaWF0IjoxNzQxNjkyODM2LCJqdGkiOiI0NDNmNzJkMGYwODM0MTdhOTE4ZDE5NzQ2MTc1NjY4NCIsInVzZXJfaWQiOjN9.ycYN39i-Xhna0sgzCzNGpqpm4hx9ERvuMKU87ONhsTk', '2025-03-11 11:33:56.029477', '2025-03-18 11:33:56.000000', 3, '443f72d0f083417a918d197461756684'),
(27, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjMwMDE3NywiaWF0IjoxNzQxNjk1Mzc3LCJqdGkiOiIxYWQzZGVjY2Y5NWY0MzQyOTZkZGRmMjBjNjdlMDZlZCIsInVzZXJfaWQiOjN9.emAtEHTI5EAsrkJQ-6Pfkr_KZKDw3VUFIKAmZ0EExqY', '2025-03-11 12:16:17.923959', '2025-03-18 12:16:17.000000', 3, '1ad3deccf95f434296dddf20c67e06ed'),
(28, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjQ1NTQ4NSwiaWF0IjoxNzQxODUwNjg1LCJqdGkiOiIzN2ZhNDUzMjljZWY0YzhlYTUxZGU3OWQ4NzBkNjNiNiIsInVzZXJfaWQiOjN9.7BYYJTokAk9uNT5L6fEDZuOd2O3fGPTOVkpfIHLcbeA', '2025-03-13 07:24:45.686024', '2025-03-20 07:24:45.000000', 3, '37fa45329cef4c8ea51de79d870d63b6'),
(29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjQ1Njc3MCwiaWF0IjoxNzQxODUxOTcwLCJqdGkiOiJiMmJhZmVlZGNlZDc0MDBlOWM3Y2UxMzM5M2U0YzFjYSIsInVzZXJfaWQiOjN9.Tlk3jKL9cyoeDNioAxLarge2YSuuPUT82Pom8ST94y8', '2025-03-13 07:46:10.283548', '2025-03-20 07:46:10.000000', 3, 'b2bafeedced7400e9c7ce13393e4c1ca'),
(30, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjQ1ODMyNCwiaWF0IjoxNzQxODUzNTI0LCJqdGkiOiI5ODJmOTJiNjZlOTc0NjQxODkzMzFiYWNlYTcyY2MxNSIsInVzZXJfaWQiOjN9.bVgYDnWLugTRZhH9VlZjMQUnaZQ9agkfNWdT0D7YVto', '2025-03-13 08:12:04.074948', '2025-03-20 08:12:04.000000', 3, '982f92b66e97464189331bacea72cc15'),
(31, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjU0NDg3MSwiaWF0IjoxNzQxOTQwMDcxLCJqdGkiOiI0MWNiMDU1ZjEzNzE0ZmE1YmRkYTRkZDRmN2I2YzdiZiIsInVzZXJfaWQiOjN9.Zs2EAX65i6CwNRaL_aL-Rii6whTFDoLB2JYSP607aDg', '2025-03-14 08:14:31.735523', '2025-03-21 08:14:31.000000', 3, '41cb055f13714fa5bdda4dd4f7b6c7bf'),
(32, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjU0ODAzNSwiaWF0IjoxNzQxOTQzMjM1LCJqdGkiOiI5MDEzNTRmYTk5ODY0MzEwYTdjYTJhOGQ1Y2U1ZmNjMyIsInVzZXJfaWQiOjN9.5Y0ulpjDp0zrrGqRvfglO5Pi7L3yWLJp0jk0oKJ6zPw', '2025-03-14 09:07:15.022581', '2025-03-21 09:07:15.000000', 3, '901354fa99864310a7ca2a8d5ce5fcc3'),
(33, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MjgwNzg5NywiaWF0IjoxNzQyMjAzMDk3LCJqdGkiOiJjMzBjMWE4YmNkMjE0Y2FjYmI3ZDU2Njc2YTFmODE2NCIsInVzZXJfaWQiOjN9.SdD3zcij8tReTTg4qXCp6xLozje4lpg9DK8BTiUbw2Y', '2025-03-17 09:18:17.727862', '2025-03-24 09:18:17.000000', 3, 'c30c1a8bcd214cacbb7d56676a1f8164'),
(34, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzQxMzA3MywiaWF0IjoxNzQyODA4MjczLCJqdGkiOiI4NTI0OWM4M2M2MDA0ZGZmOTI5MTI1NTEzMTNkNjQzYSIsInVzZXJfaWQiOjN9.YpqWL6Rv52EuwobKjfSX3DWim7TOk6Rj3kATqeUUPIc', '2025-03-24 09:24:33.737866', '2025-03-31 09:24:33.000000', 3, '85249c83c6004dff92912551313d643a'),
(35, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzQxNzI0OSwiaWF0IjoxNzQyODEyNDQ5LCJqdGkiOiI4OGJiOGJlMmU0YmI0ODllOGI0NmQyN2QzODRmNWU3YiIsInVzZXJfaWQiOjN9.SemW5rN-cF5d4hTC-9B3frb8gsbwxaMB4iFw_32v-TI', '2025-03-24 10:34:09.343002', '2025-03-31 10:34:09.000000', 3, '88bb8be2e4bb489e8b46d27d384f5e7b'),
(36, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzUwMjI5OSwiaWF0IjoxNzQyODk3NDk5LCJqdGkiOiI5YWIzZTQ0Njg1MGE0YTZjYTU1M2Q1ZWQyZDNhNTkzZiIsInVzZXJfaWQiOjN9.O46Dvd4zq8Glei5gCwDVlwOm3t5fd46aewSrNZeDODU', '2025-03-25 10:11:39.038461', '2025-04-01 10:11:39.000000', 3, '9ab3e446850a4a6ca553d5ed2d3a593f'),
(37, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzYxODQyMywiaWF0IjoxNzQzMDEzNjIzLCJqdGkiOiI4OGZiN2Q5MTVlMTQ0YmM1OWI3ZTA3YTMxNDdjYWNjYyIsInVzZXJfaWQiOjN9.ZYxf_TLPUzOOf6AVXb5RwTnk8FAG_ItPAcxIkz6jEn8', '2025-03-26 18:27:03.350847', '2025-04-02 18:27:03.000000', 3, '88fb7d915e144bc59b7e07a3147caccc'),
(38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2NjY4NiwiaWF0IjoxNzQzMDYxODg2LCJqdGkiOiI0OGQwNGExNzlhMzg0NzQ2OWFlZGJmYzkyYzZjZTQzZCIsInVzZXJfaWQiOjF9.gya8ejJVFDyt4A_JkDYk1DdkwQzHvw6FNT0K4Ep17eo', '2025-03-27 07:51:26.202291', '2025-04-03 07:51:26.000000', 1, '48d04a179a3847469aedbfc92c6ce43d'),
(39, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2NjczNCwiaWF0IjoxNzQzMDYxOTM0LCJqdGkiOiI0Yjk0MWNhNGE4MDA0MDljOGViOTdhOTFhZTQxOTYzZCIsInVzZXJfaWQiOjF9.wg6C0yL9A0yw7DG5QZL_0nNCJ4BmicMxfT3_n7v2dh0', '2025-03-27 07:52:14.104603', '2025-04-03 07:52:14.000000', 1, '4b941ca4a800409c8eb97a91ae41963d'),
(40, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2Njc3OSwiaWF0IjoxNzQzMDYxOTc5LCJqdGkiOiI1MTYwNDY4ZGY3NmI0NWM4YTkzZGMzZjA3ZGY4NDljNSIsInVzZXJfaWQiOjF9.yUfrrQlSOzzzbGuRGU7Ova0C0oFMAoOP2dea_zZ6v48', '2025-03-27 07:52:59.659558', '2025-04-03 07:52:59.000000', 1, '5160468df76b45c8a93dc3f07df849c5'),
(41, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2NzI2NCwiaWF0IjoxNzQzMDYyNDY0LCJqdGkiOiIwZmY5NDBhMmE2YWI0NWQ5OGRmZTdkODhiNjliYjRjZiIsInVzZXJfaWQiOjF9.-P8ZdZrNo274BP0da06fv9P91fmUjWCtpnCtnBN-0Bg', '2025-03-27 08:01:04.875259', '2025-04-03 08:01:04.000000', 1, '0ff940a2a6ab45d98dfe7d88b69bb4cf'),
(42, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2NzI5MSwiaWF0IjoxNzQzMDYyNDkxLCJqdGkiOiI3Y2ZmNWVhNjg0MmQ0MTVmODBiMjc1MzVjMGUzYTE4NyIsInVzZXJfaWQiOjF9.T9Idb01kjZ35-Bn_2Pw0F8KJMSA-wiGT-JHgbLpQIpo', '2025-03-27 08:01:31.968267', '2025-04-03 08:01:31.000000', 1, '7cff5ea6842d415f80b27535c0e3a187'),
(43, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2NzMyOCwiaWF0IjoxNzQzMDYyNTI4LCJqdGkiOiJkZDdhZTNlNWUxMjE0ZjIwODI0NzM5NmU3N2VlNDc0YiIsInVzZXJfaWQiOjN9.kBJDBHWOvj--o8hG2nxwitZKzTl-xFUkfxhBBn6CAbo', '2025-03-27 08:02:08.216566', '2025-04-03 08:02:08.000000', 3, 'dd7ae3e5e1214f208247396e77ee474b'),
(44, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2NzM0NSwiaWF0IjoxNzQzMDYyNTQ1LCJqdGkiOiIxY2NjNzQ3M2Y2N2U0NzVlOGE5NTNmNWIyM2I0ZjZlNyIsInVzZXJfaWQiOjN9.PSmBPNbIkL1LKnACEKXp7eny54TDWpvmZCDGiWwitPw', '2025-03-27 08:02:25.552424', '2025-04-03 08:02:25.000000', 3, '1ccc7473f67e475e8a953f5b23b4f6e7'),
(45, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2NzM3NywiaWF0IjoxNzQzMDYyNTc3LCJqdGkiOiJiNTI0ZDQxYmM0NDk0YWI4YjAzMjNkMGJlZDhiZDg1YyIsInVzZXJfaWQiOjN9.K-zAvLVgFVnFvuPloFLLnSZ53x5nbWzu5KK3DbZUE3w', '2025-03-27 08:02:57.444810', '2025-04-03 08:02:57.000000', 3, 'b524d41bc4494ab8b0323d0bed8bd85c'),
(46, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2NzU5MywiaWF0IjoxNzQzMDYyNzkzLCJqdGkiOiI5NjcyMGY5ZmRkZmE0MjY1YjJjNDU1ODcxZTc4ODA2OCIsInVzZXJfaWQiOjF9.ky-1hC7g7mPAEipNPWvwgnmkGWAmLNYngT9J8BzQJfg', '2025-03-27 08:06:33.122339', '2025-04-03 08:06:33.000000', 1, '96720f9fddfa4265b2c455871e788068'),
(47, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2NzYwOSwiaWF0IjoxNzQzMDYyODA5LCJqdGkiOiI1YzU4MTBjMmEyNmE0MjlhODM5ZGI5NzE4ZjY1MzE3ZCIsInVzZXJfaWQiOjF9.MRiBFHdjFVF6triDcKvNLEa_G0wIjXkW_UWn5N2NJno', '2025-03-27 08:06:49.764848', '2025-04-03 08:06:49.000000', 1, '5c5810c2a26a429a839db9718f65317d'),
(48, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2NzYyMSwiaWF0IjoxNzQzMDYyODIxLCJqdGkiOiJhYjM3YjRmZGM5Mjc0ZjQ2YWNjMWY5NzBiOWE5YzUwOCIsInVzZXJfaWQiOjN9.NZkFEMfJqixqtx0vQ3lSfKtWz09ehYq3YCNH1ByTyjE', '2025-03-27 08:07:01.261451', '2025-04-03 08:07:01.000000', 3, 'ab37b4fdc9274f46acc1f970b9a9c508'),
(49, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2ODIwMCwiaWF0IjoxNzQzMDYzNDAwLCJqdGkiOiI1ZDc5MGQwYmIzNmY0OGM0YjY5MzZhNjQxODgyYTM1NiIsInVzZXJfaWQiOjF9.uRFGlhGTSQUJID_l7TmP-SogyEDER9JHmpufC_tAtyk', '2025-03-27 08:16:40.888733', '2025-04-03 08:16:40.000000', 1, '5d790d0bb36f48c4b6936a641882a356'),
(50, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2ODkxNCwiaWF0IjoxNzQzMDY0MTE0LCJqdGkiOiIzODIyYTUyMTI4ZmE0NzM5YTM0YzMyMDIzNmFmNjEzYyIsInVzZXJfaWQiOjF9.Q8ZuwH_n-1HxL61f6I7DwA6hDFG0X1ATg6vx_8lRf7E', '2025-03-27 08:28:34.088305', '2025-04-03 08:28:34.000000', 1, '3822a52128fa4739a34c320236af613c'),
(51, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2OTAzNCwiaWF0IjoxNzQzMDY0MjM0LCJqdGkiOiI3MDBmZTE3NTY5MTE0YmI5ODY4NTY1MjQyMTk2NDM4MiIsInVzZXJfaWQiOjF9.E4EE5TDrL3AUS1NkHIZTL1H_ueptbRmCDfETDyAoW7A', '2025-03-27 08:30:34.925201', '2025-04-03 08:30:34.000000', 1, '700fe17569114bb98685652421964382'),
(52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2OTA2MiwiaWF0IjoxNzQzMDY0MjYyLCJqdGkiOiI1NjU4OTUzYmM0NTg0NDA2YmY1NGEyYjBiOWFiMzFiYyIsInVzZXJfaWQiOjF9.wj-dwB8xcwioqiN18iuDDtTOC4Cw-awp65qfyIQPPIs', '2025-03-27 08:31:02.861111', '2025-04-03 08:31:02.000000', 1, '5658953bc4584406bf54a2b0b9ab31bc'),
(53, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2OTA3NSwiaWF0IjoxNzQzMDY0Mjc1LCJqdGkiOiI1NTkyYmJjY2I2OGI0NzI4OTlmYmNmMzEwYTM4ZDNmOSIsInVzZXJfaWQiOjN9.6biQsAGrwTIdtoltM5NZ_MbS8zXcq1mY920V8b9SFvM', '2025-03-27 08:31:15.745080', '2025-04-03 08:31:15.000000', 3, '5592bbccb68b472899fbcf310a38d3f9'),
(54, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2OTEyOSwiaWF0IjoxNzQzMDY0MzI5LCJqdGkiOiJhMGUwZjQzM2FiZmY0ZTY3YjU3MDJkNjE2YmVmYjNkMyIsInVzZXJfaWQiOjN9.PDCQ1Bkk6QRablAxubgkkjulxfgvtNsXxqfHSlj3SbU', '2025-03-27 08:32:09.662694', '2025-04-03 08:32:09.000000', 3, 'a0e0f433abff4e67b5702d616befb3d3'),
(55, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2OTE0MiwiaWF0IjoxNzQzMDY0MzQyLCJqdGkiOiIxNTNlNWI5ZTA5OTY0MTJhYTE5YWVhNjFhYzk4ZjJiNCIsInVzZXJfaWQiOjF9.bvYIHkizMi_A-KCZAKyhVL7tk6oRPgZC1KpHvW7CykQ', '2025-03-27 08:32:22.528716', '2025-04-03 08:32:22.000000', 1, '153e5b9e0996412aa19aea61ac98f2b4'),
(56, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2OTczNywiaWF0IjoxNzQzMDY0OTM3LCJqdGkiOiI5NmM3NGRjNGRiZTA0YWYxOWUxYTcwOTA5N2I4N2Y5NCIsInVzZXJfaWQiOjN9.bYfP4FedONGwo0Gf7vRfZUHmVTp6AO5rIN88d2EypkM', '2025-03-27 08:42:17.517367', '2025-04-03 08:42:17.000000', 3, '96c74dc4dbe04af19e1a709097b87f94'),
(57, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY2OTc4MSwiaWF0IjoxNzQzMDY0OTgxLCJqdGkiOiI4ZGNiNWI4NjBjYzE0YTkwYWM4NTIzMDYyMzdiOGI2MyIsInVzZXJfaWQiOjF9.EfXEMWAbltZ2snLUDpKxNJrUaG8ybbtqPt6JlGSSNlQ', '2025-03-27 08:43:01.742281', '2025-04-03 08:43:01.000000', 1, '8dcb5b860cc14a90ac852306237b8b63'),
(58, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY3MDEyMywiaWF0IjoxNzQzMDY1MzIzLCJqdGkiOiJkMTFlNWY5ZTQ5MzY0OTc5OTVhYjE3YmJlNzZmNGRlOSIsInVzZXJfaWQiOjN9.XGnjcCvEaZhK-Lcx1GzPUtMzB0gDd5_NSemVwtOeXgY', '2025-03-27 08:48:43.682534', '2025-04-03 08:48:43.000000', 3, 'd11e5f9e4936497995ab17bbe76f4de9'),
(59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY3MDUxMywiaWF0IjoxNzQzMDY1NzEzLCJqdGkiOiIwMGE4MzE4YWI4MGM0NGZhYjZjODgxOTY2ODQ5ZDhjNSIsInVzZXJfaWQiOjF9.kTeZ1nGV3dVKZy8upt6rSYKwGFBwJutezcOxU_LdXMA', '2025-03-27 08:55:13.734426', '2025-04-03 08:55:13.000000', 1, '00a8318ab80c44fab6c881966849d8c5'),
(60, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY3MDU3NSwiaWF0IjoxNzQzMDY1Nzc1LCJqdGkiOiI1YjRiNmYxZWIxYTE0ZmUwYmE5NjQwNDc2NGZhODMxMCIsInVzZXJfaWQiOjN9.Hk9obCVSEu3NSUYocuIwEDwbqGJ9ti2w9y_cpDGSAcU', '2025-03-27 08:56:15.096692', '2025-04-03 08:56:15.000000', 3, '5b4b6f1eb1a14fe0ba96404764fa8310'),
(61, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY3MDU5NywiaWF0IjoxNzQzMDY1Nzk3LCJqdGkiOiJiOTZkY2EwYzU4ZjE0Yzc5YTE0OTAzMTFmMzk4MDViNCIsInVzZXJfaWQiOjF9.lyCbXkpkydRYKXmFWfkHCfAueo1vSRcqrfLvTb0U9iU', '2025-03-27 08:56:37.806181', '2025-04-03 08:56:37.000000', 1, 'b96dca0c58f14c79a1490311f39805b4'),
(62, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY3MjM5MSwiaWF0IjoxNzQzMDY3NTkxLCJqdGkiOiI1ZTMyMDBiYzVlNzk0NzU5YWMzMWE4MDA1OWI5ZGNmNiIsInVzZXJfaWQiOjN9.OpVhcD_FWQHKnE_gtZ7A6E2xrznp071j1Ges0-A5GxQ', '2025-03-27 09:26:31.477114', '2025-04-03 09:26:31.000000', 3, '5e3200bc5e794759ac31a80059b9dcf6'),
(63, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY3NTc1OSwiaWF0IjoxNzQzMDcwOTU5LCJqdGkiOiI2MjM3MTZkN2UzMDg0MjUwOGZjNDhlNzgzMzMxZDE5ZCIsInVzZXJfaWQiOjN9.6IjXe7-6OW7Ym_oSSub4VNjbywyWoJQYt7osalWxXwQ', '2025-03-27 10:22:39.841943', '2025-04-03 10:22:39.000000', 3, '623716d7e30842508fc48e783331d19d'),
(64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY3NzEyMywiaWF0IjoxNzQzMDcyMzIzLCJqdGkiOiI2YmU2N2JlYWRjMzU0ZmQzODI5Nzc2OGJkMTMwYjNkMyIsInVzZXJfaWQiOjF9.wagvrxDI3exquCwkEgHsJykaX-alu49uwp3vmsObNvk', '2025-03-27 10:45:23.779568', '2025-04-03 10:45:23.000000', 1, '6be67beadc354fd38297768bd130b3d3'),
(65, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY3NzIyOCwiaWF0IjoxNzQzMDcyNDI4LCJqdGkiOiI0MWQ3MWM3ZmU4YWU0YTEzOTVlNWI2YTRhNDA5YzI4YyIsInVzZXJfaWQiOjN9.YPJhZ_3j8fkw65E4tJy4fdbNF_2S2OxSRnP9_jL2mo0', '2025-03-27 10:47:08.877310', '2025-04-03 10:47:08.000000', 3, '41d71c7fe8ae4a1395e5b6a4a409c28c'),
(66, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY3NzU1OSwiaWF0IjoxNzQzMDcyNzU5LCJqdGkiOiJlYzgyMTQ0YWIzNjg0ZmU1OGIyZmM5YjUxOGIwMTZkZCIsInVzZXJfaWQiOjF9.iNqKM_bBhRn1OnomaA9WAqgpZcjqNXxBBcPW7lXUzzU', '2025-03-27 10:52:39.685998', '2025-04-03 10:52:39.000000', 1, 'ec82144ab3684fe58b2fc9b518b016dd'),
(67, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY3NzcyMiwiaWF0IjoxNzQzMDcyOTIyLCJqdGkiOiI5ODYzZmVjMDE4YmY0NTMzYjM0MzAxZTY1ZGVkYTNhOSIsInVzZXJfaWQiOjN9.Ml3DVCPDTFbrMFJjGuqvvmsBtqTj12uDnO-mpi5KXJM', '2025-03-27 10:55:22.343659', '2025-04-03 10:55:22.000000', 3, '9863fec018bf4533b34301e65deda3a9'),
(68, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY3ODk2OSwiaWF0IjoxNzQzMDc0MTY5LCJqdGkiOiJiMTBkN2JmMGE1YTg0NWM0ODdiZDMyNGMzNGE3M2I2NCIsInVzZXJfaWQiOjF9.WWBUMGtTOSOzOJcQdrLRypH01a4_au2vzX8KIS_JEOA', '2025-03-27 11:16:09.872644', '2025-04-03 11:16:09.000000', 1, 'b10d7bf0a5a845c487bd324c34a73b64'),
(69, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY4MDkzMSwiaWF0IjoxNzQzMDc2MTMxLCJqdGkiOiJmYzQxYjkzOGUyYmE0MzUzYmVjYzA4YTY2MTdjNzE5ZiIsInVzZXJfaWQiOjN9.IxzetVT738MYUdbUgdtaeefFi7px_BoL8raMV7QkWgY', '2025-03-27 11:48:51.358802', '2025-04-03 11:48:51.000000', 3, 'fc41b938e2ba4353becc08a6617c719f'),
(70, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzY4MzI2OCwiaWF0IjoxNzQzMDc4NDY4LCJqdGkiOiJiNmI1NzlmMjNhNWI0ODQzOTVkMWVhZGU5MDYyZTNmNSIsInVzZXJfaWQiOjN9.cp4zUPcT2ydS18xAw9Exsgc5PI6p3hshb5ElCieu6b4', '2025-03-27 12:27:48.516431', '2025-04-03 12:27:48.000000', 3, 'b6b579f23a5b484395d1eade9062e3f5'),
(71, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDAxNTE0MywiaWF0IjoxNzQzNDEwMzQzLCJqdGkiOiJkODRjMmM3NGEwNTA0OTA1ODFkOWIwOTk2OGI0Y2MyMCIsInVzZXJfaWQiOjN9.CCg3cig9xDY0f-V73vD0pGoR_P4jhJ2VyRH6sLajt6I', '2025-03-31 08:39:03.967988', '2025-04-07 08:39:03.000000', 3, 'd84c2c74a050490581d9b09968b4cc20'),
(72, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDEwMDYzMSwiaWF0IjoxNzQzNDk1ODMxLCJqdGkiOiIwYWU4ZjA3NTczMGE0MTUzYmE0NmM2NTliZTY3NTc0NSIsInVzZXJfaWQiOjZ9.vQtxkt6xVYmYtdJnEMKaO_MpxUDT-A1BMtqG9RRdvlk', '2025-04-01 08:23:51.208387', '2025-04-08 08:23:51.000000', 6, '0ae8f075730a4153ba46c659be675745'),
(73, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDEwNTI0MiwiaWF0IjoxNzQzNTAwNDQyLCJqdGkiOiJmODY2MjQ5OTMwMmE0NTRkODQwZmE1YWQyZmExYzk0MyIsInVzZXJfaWQiOjF9.Uh721zwtfPXj-k8vNTff3n7rgI_OMzhJ4v3HrtUxmdg', '2025-04-01 09:40:42.739686', '2025-04-08 09:40:42.000000', 1, 'f8662499302a454d840fa5ad2fa1c943'),
(74, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDEwNTI2MiwiaWF0IjoxNzQzNTAwNDYyLCJqdGkiOiIzZTI2YWM1NGM1YWM0YzBiYTg1YzA5ODM0NDBkNjMyYiIsInVzZXJfaWQiOjZ9.IAb2VsnsuxvEel3XuQqnrdM8IY9j6URSp_3l3MDyK7s', '2025-04-01 09:41:02.141411', '2025-04-08 09:41:02.000000', 6, '3e26ac54c5ac4c0ba85c0983440d632b'),
(75, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDEwNTczMiwiaWF0IjoxNzQzNTAwOTMyLCJqdGkiOiI4ODFmYzk1Yzc4Y2Q0ZDdiOTdhMzAwZmQ0Yzc3YzQ0ZiIsInVzZXJfaWQiOjF9.pJrrLk09LC61dCrl-wtKGBimYs8t28l7c3M_p4BkdR4', '2025-04-01 09:48:52.812240', '2025-04-08 09:48:52.000000', 1, '881fc95c78cd4d7b97a300fd4c77c44f'),
(76, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDEwNjU4OCwiaWF0IjoxNzQzNTAxNzg4LCJqdGkiOiIxMDk3YWFjYmMxNmE0MzcxYjhhYzVkYTk1YTFlY2FjNiIsInVzZXJfaWQiOjZ9.hXiBw274Q-VGKn0a4ralImMPFxkHlfo0AyFDg9stGoM', '2025-04-01 10:03:08.207760', '2025-04-08 10:03:08.000000', 6, '1097aacbc16a4371b8ac5da95a1ecac6'),
(77, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDEwOTE1NiwiaWF0IjoxNzQzNTA0MzU2LCJqdGkiOiI1YzFkZWFiNTNiMjk0NjBiYmJkMDM2ZGNiYjk1ZGI1OCIsInVzZXJfaWQiOjF9._PSVt1z6Kd2njpSisyRRHusSc1tV1p1KLtnVOZSgD8c', '2025-04-01 10:45:56.468337', '2025-04-08 10:45:56.000000', 1, '5c1deab53b29460bbbd036dcbb95db58'),
(78, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDEwOTgwMCwiaWF0IjoxNzQzNTA1MDAwLCJqdGkiOiI4ZWFhNGRjMzQ0ZjU0OWNhOTc1MDA1ZjE2NGUzNzE2ZSIsInVzZXJfaWQiOjZ9.UhJM6PXYcAMrQITsWVZchQRzN73rVXS0QrNnXt4yAho', '2025-04-01 10:56:40.340713', '2025-04-08 10:56:40.000000', 6, '8eaa4dc344f549ca975005f164e3716e'),
(79, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDExMDk5NCwiaWF0IjoxNzQzNTA2MTk0LCJqdGkiOiJlZjFiYTI2MzY3NWM0OGI0YjQwOWVlZmE1NGNmOTFkYiIsInVzZXJfaWQiOjF9.qoSnQUDfSnQy9wi1n_kkVI9W-u0JZGS-ioTEmFSSPuY', '2025-04-01 11:16:34.489856', '2025-04-08 11:16:34.000000', 1, 'ef1ba263675c48b4b409eefa54cf91db'),
(80, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDIxODM1NiwiaWF0IjoxNzQzNjEzNTU2LCJqdGkiOiIzODIxZmIxMjlhYTU0ZWI2YTE2NDQ3OWJhZGYwNTBiMCIsInVzZXJfaWQiOjF9.k6dYnYzbppv_Yk90SgErDJyfas6d7T1RshhVi79Cz5o', '2025-04-02 17:05:56.898490', '2025-04-09 17:05:56.000000', 1, '3821fb129aa54eb6a164479badf050b0'),
(81, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDIxOTA4MywiaWF0IjoxNzQzNjE0MjgzLCJqdGkiOiIxMjJjZWM2MzkxM2U0ZDFjOTExMzgyMzU4NTE1MzVkZiIsInVzZXJfaWQiOjN9.43emAmtmMVI10b7LvP1cRu8REIdzj5NxaH_WglvHoDY', '2025-04-02 17:18:03.789004', '2025-04-09 17:18:03.000000', 3, '122cec63913e4d1c91138235851535df'),
(82, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDIxOTg1NywiaWF0IjoxNzQzNjE1MDU3LCJqdGkiOiIyMDdkOWE3ZmUxMzg0MmRjODQ3NTE0ZjJjMDAxNWViOSIsInVzZXJfaWQiOjF9.t3YV_L-JlFwEWrxZzV-d_4Ip1kS2jLxQSJyljvZk5hY', '2025-04-02 17:30:57.047057', '2025-04-09 17:30:57.000000', 1, '207d9a7fe13842dc847514f2c0015eb9'),
(83, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDIyMjkyNSwiaWF0IjoxNzQzNjE4MTI1LCJqdGkiOiJiYzdkNWI3YTk1NWM0NDA2OWZiYmI0NjU2OGQ0NTIzYyIsInVzZXJfaWQiOjZ9.O4K3WpxuzRiWISFy-_-P2PPXzc0jE0t19MrQL181z_s', '2025-04-02 18:22:05.510804', '2025-04-09 18:22:05.000000', 6, 'bc7d5b7a955c44069fbbb46568d4523c'),
(84, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDIyMzAxNywiaWF0IjoxNzQzNjE4MjE3LCJqdGkiOiIwNDY2NDE5MjhmMmQ0ZDgyOTc5MDFhZjE4NWQ3YzU3MyIsInVzZXJfaWQiOjN9.ipPXpZvtI7-1K957qY65LlRpCh3UCedqHqReB5k1RSI', '2025-04-02 18:23:37.802621', '2025-04-09 18:23:37.000000', 3, '046641928f2d4d8297901af185d7c573'),
(85, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDIyNjU1MSwiaWF0IjoxNzQzNjIxNzUxLCJqdGkiOiI2ODg4Nzg3NWI5MzI0YzNiODZkNDZjNzc2MmIxOWZiZSIsInVzZXJfaWQiOjZ9.Yr_bUcQJJOzNJLXfBPfK-RnSFSIbX2sIetkryQ7vWnI', '2025-04-02 19:22:31.153335', '2025-04-09 19:22:31.000000', 6, '68887875b9324c3b86d46c7762b19fbe'),
(86, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2NTU4MCwiaWF0IjoxNzQzNjYwNzgwLCJqdGkiOiJkZjI0NTY1YTliY2I0MTExOTQwY2QzZWY0ZDkxMWU1ZiIsInVzZXJfaWQiOjF9.BV9fnptT-Z0VB6UKnXITjklMVnOk5lottz0_PKxXk2Q', '2025-04-03 06:13:00.248484', '2025-04-10 06:13:00.000000', 1, 'df24565a9bcb4111940cd3ef4d911e5f'),
(87, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2NTYwMSwiaWF0IjoxNzQzNjYwODAxLCJqdGkiOiI5OWYzNmYzZWU1NjY0YjMyOGI5YTA1YmZjMGQ2MTdhMiIsInVzZXJfaWQiOjF9.Nj5l9KEhbgxsM4HicK9EOVw03WjlitjMQ6hlt-paG64', '2025-04-03 06:13:21.292399', '2025-04-10 06:13:21.000000', 1, '99f36f3ee5664b328b9a05bfc0d617a2'),
(88, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2NTY1NiwiaWF0IjoxNzQzNjYwODU2LCJqdGkiOiJlYzk0MTk3MjA1ZjM0NjEzODA3MjE5NzA2MjJiMzE5YiIsInVzZXJfaWQiOjN9.gwXAj7J7EYofnSX9dTgsU5CCCwgNlDPmxOJ1jkARWVs', '2025-04-03 06:14:16.388675', '2025-04-10 06:14:16.000000', 3, 'ec94197205f3461380721970622b319b'),
(89, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2NTY4OCwiaWF0IjoxNzQzNjYwODg4LCJqdGkiOiIwODY3MjI3YTRjMDE0ODEyOGFkNzEzOWEyZDZlOGI1NiIsInVzZXJfaWQiOjZ9.kdXDiEpm0B6yyhYSiDVHsguDEONnQpBQKyOIC5Us6mk', '2025-04-03 06:14:48.395121', '2025-04-10 06:14:48.000000', 6, '0867227a4c0148128ad7139a2d6e8b56'),
(90, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2NjEwMiwiaWF0IjoxNzQzNjYxMzAyLCJqdGkiOiIxNzAxYTZmM2QxMjA0NDU1YWI2NGU1YTBjZjY2NTFlNyIsInVzZXJfaWQiOjN9.G-uGFUOcz7vwMZJ3tgUPNQ8wAEsT-GFoMuIBRCsBzP4', '2025-04-03 06:21:42.825663', '2025-04-10 06:21:42.000000', 3, '1701a6f3d1204455ab64e5a0cf6651e7'),
(91, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2NjM2NywiaWF0IjoxNzQzNjYxNTY3LCJqdGkiOiI4YjM5YmIwMWFiODM0OGYxYTlhMmU4NDhiNDM0NmZhZiIsInVzZXJfaWQiOjZ9.u0UblR83ULUKfy_EYLuJvpVWbsO9xamvpYqUqVx5nW8', '2025-04-03 06:26:07.555569', '2025-04-10 06:26:07.000000', 6, '8b39bb01ab8348f1a9a2e848b4346faf'),
(92, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2NjYzMSwiaWF0IjoxNzQzNjYxODMxLCJqdGkiOiJmZTM3MGUyNGI1MDc0YWM0OGVjNDg5NTlhZTVkMzJhZCIsInVzZXJfaWQiOjN9.wvXrnGrDVrKHihgm6etY-N0SzbC5ntjbxpWQMRhOX-M', '2025-04-03 06:30:31.313303', '2025-04-10 06:30:31.000000', 3, 'fe370e24b5074ac48ec48959ae5d32ad'),
(93, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2NjY0NCwiaWF0IjoxNzQzNjYxODQ0LCJqdGkiOiI5MjRjOGJhODBhMTU0ZGVkYTQ3NjQ2ZjIyNGVmN2U5MiIsInVzZXJfaWQiOjN9.DFpMiG4XdWSSPCU_IOllHUn4pvq-WrTVKDwubLT5dPo', '2025-04-03 06:30:44.323236', '2025-04-10 06:30:44.000000', 3, '924c8ba80a154deda47646f224ef7e92'),
(94, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2Njk5MCwiaWF0IjoxNzQzNjYyMTkwLCJqdGkiOiJlMTA0MjZkNTY4ZWE0NGIxYTk0NThmODdhZTNkYzlkZSIsInVzZXJfaWQiOjZ9.kKP7q7bWGEx1A2RDJgfFVMc2LTDrS1BSt-sL06MStQk', '2025-04-03 06:36:30.960380', '2025-04-10 06:36:30.000000', 6, 'e10426d568ea44b1a9458f87ae3dc9de'),
(95, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2NzIxMSwiaWF0IjoxNzQzNjYyNDExLCJqdGkiOiI5OWQ0YjY4NDJkZTg0ZWQ3OWZiMjUwY2ZkZjgyYTY3NSIsInVzZXJfaWQiOjF9.e8Pu9zM8CKLinu-4CMyDSWnaekeETjNwwfwir6ASZQ0', '2025-04-03 06:40:11.255953', '2025-04-10 06:40:11.000000', 1, '99d4b6842de84ed79fb250cfdf82a675'),
(96, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2NzI1MSwiaWF0IjoxNzQzNjYyNDUxLCJqdGkiOiIxM2VlMDBmOWVhY2E0M2E4YjU3NjdkY2UyNjFmMjEzZCIsInVzZXJfaWQiOjN9.LSGk4c-mfX8ap5Kw9wsmqmt-qmqWqQWXGcnigfWc_ag', '2025-04-03 06:40:51.322729', '2025-04-10 06:40:51.000000', 3, '13ee00f9eaca43a8b5767dce261f213d'),
(97, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2Nzc1MiwiaWF0IjoxNzQzNjYyOTUyLCJqdGkiOiI1NDU3YzlhMjA4NjM0OGViYWI3ZmM3MmM1NDEzZGQ1MyIsInVzZXJfaWQiOjZ9.RKjOpoGJR0M34aDkpDKdA4Msvs8aJRV6Zzs9UMZrFHk', '2025-04-03 06:49:12.950568', '2025-04-10 06:49:12.000000', 6, '5457c9a2086348ebab7fc72c5413dd53'),
(98, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2Nzc2MywiaWF0IjoxNzQzNjYyOTYzLCJqdGkiOiJlMDhmZTA1NTc4Zjk0NzA2YmNjZDM1Njk4N2U5ZjNlOCIsInVzZXJfaWQiOjF9.jSGz--5dtgaMTTPMd5Om8MDnnjASqG2_myBe1uDnIqY', '2025-04-03 06:49:23.933723', '2025-04-10 06:49:23.000000', 1, 'e08fe05578f94706bccd356987e9f3e8'),
(99, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2NzgwMiwiaWF0IjoxNzQzNjYzMDAyLCJqdGkiOiI4NTlmNmRhY2RhYWQ0M2ZhOWRmYzNhMTZiZjIyNjJlMyIsInVzZXJfaWQiOjN9.aZO8zVbJWhLq0JaDE0Dad2TP5fT4Y1iM7BSOrNqQatw', '2025-04-03 06:50:02.497457', '2025-04-10 06:50:02.000000', 3, '859f6dacdaad43fa9dfc3a16bf2262e3'),
(100, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2Nzk3OSwiaWF0IjoxNzQzNjYzMTc5LCJqdGkiOiI3MGIzZDUzYTIzYzM0ZDE1YWU5ZDJiNzZjZDNjZWU0MCIsInVzZXJfaWQiOjN9.L3juwUZhprgEzALN_rr1r57WQRAXDhlW8eD85creLUU', '2025-04-03 06:52:59.134610', '2025-04-10 06:52:59.000000', 3, '70b3d53a23c34d15ae9d2b76cd3cee40'),
(101, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2Nzk4OSwiaWF0IjoxNzQzNjYzMTg5LCJqdGkiOiJmMzYzYWVlNTc5MTk0ZTk5YTk3MDYyZDZhY2RjMjViYiIsInVzZXJfaWQiOjZ9.FA6LVeSgLZDCpJr-yuSqwMGi8G1POSNvAdx2DiAAufE', '2025-04-03 06:53:09.827733', '2025-04-10 06:53:09.000000', 6, 'f363aee579194e99a97062d6acdc25bb'),
(102, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI2OTk1MCwiaWF0IjoxNzQzNjY1MTUwLCJqdGkiOiI0ZGQxZjlmNDJmMWQ0NDIwYjEyYWVlMjQyNWJiYjY5YyIsInVzZXJfaWQiOjF9.KULJCpymtYuamsVyBk5ueYhiDSmx1h5b04lyEj_qkhs', '2025-04-03 07:25:50.237066', '2025-04-10 07:25:50.000000', 1, '4dd1f9f42f1d4420b12aee2425bbb69c'),
(103, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI3MDQ5NSwiaWF0IjoxNzQzNjY1Njk1LCJqdGkiOiI0Zjg1YmY4ZjFlOTA0ODkxYjI4ZGRjYmFjZGU2MGUyYSIsInVzZXJfaWQiOjF9.kzkaWFEwMCCBN25siDZ5yXrXfO2c7BPBa4h9hQ4j05g', '2025-04-03 07:34:55.029421', '2025-04-10 07:34:55.000000', 1, '4f85bf8f1e904891b28ddcbacde60e2a'),
(104, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI3MDUxMSwiaWF0IjoxNzQzNjY1NzExLCJqdGkiOiI0MDYxZTgxNjJiYzc0M2M2YTUzYjY1ZDE4YjY0NjU2NCIsInVzZXJfaWQiOjZ9.J9sqe_vsBsBp2KxtGL27TuQZoZRdRfkWq8rIxzr3Rns', '2025-04-03 07:35:11.452629', '2025-04-10 07:35:11.000000', 6, '4061e8162bc743c6a53b65d18b646564'),
(105, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI3MjgyMCwiaWF0IjoxNzQzNjY4MDIwLCJqdGkiOiJmNDUzNzNlNWNjZWI0MTE1OGZhYjg2ZjY2YjczZmQ1NiIsInVzZXJfaWQiOjF9.IYxFNKe6n_b_zDBEtYeXavtO2yf6orLKFHT0jYP2yFA', '2025-04-03 08:13:40.957190', '2025-04-10 08:13:40.000000', 1, 'f45373e5cceb41158fab86f66b73fd56'),
(106, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI3NjI0NCwiaWF0IjoxNzQzNjcxNDQ0LCJqdGkiOiIwZjNlNGUyNTQ5OGU0ZjllOWMyYWU2MmJhZDYzM2NmZSIsInVzZXJfaWQiOjZ9.25c69je-aerfxImu76Vk-Hy2ZeCQauOCIomKxWxTgG0', '2025-04-03 09:10:44.230774', '2025-04-10 09:10:44.000000', 6, '0f3e4e25498e4f9e9c2ae62bad633cfe'),
(107, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI3OTEyNiwiaWF0IjoxNzQzNjc0MzI2LCJqdGkiOiI1M2E0ZmQ1ZmVkZGM0YjE2Yjg4MTI5Nzc2Y2IwYjU2MCIsInVzZXJfaWQiOjF9.fNEZa4qkr1GktP7iTicSPKPb2UQFH8R3zxQyBvqcYWE', '2025-04-03 09:58:46.532993', '2025-04-10 09:58:46.000000', 1, '53a4fd5feddc4b16b88129776cb0b560'),
(108, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDI4MzcxOSwiaWF0IjoxNzQzNjc4OTE5LCJqdGkiOiI5NzU5NzA0MTI0MmM0Y2RkYjI4YzQ3MzNhMjRhYjg1MiIsInVzZXJfaWQiOjF9.IWITpWTXEtpE3eRp4dlZvsjjkLzLU9DoaveXZLjYtpw', '2025-04-03 11:15:19.654355', '2025-04-10 11:15:19.000000', 1, '97597041242c4cddb28c4733a24ab852'),
(109, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDM1NTQzMSwiaWF0IjoxNzQzNzUwNjMxLCJqdGkiOiJmMDc0YjRjNTk3NmE0MjNmOGYzNjg2M2RhM2M4ZDdiMiIsInVzZXJfaWQiOjF9.KTAE2Dj6De_AiFnUiZEGWdjbZSJv_xSQeX76RdwXr1U', '2025-04-04 07:10:31.411859', '2025-04-11 07:10:31.000000', 1, 'f074b4c5976a423f8f36863da3c8d7b2'),
(110, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDM1NzIwNSwiaWF0IjoxNzQzNzUyNDA1LCJqdGkiOiI1MDk1MDA2MjUxMzQ0ZWQ4YWY2ZWJlMmJhYWRkNTUzYSIsInVzZXJfaWQiOjZ9.tz4VtFWS99GsUvBZcu6MtfpqdANztPgB227zKMKCbuw', '2025-04-04 07:40:05.370153', '2025-04-11 07:40:05.000000', 6, '5095006251344ed8af6ebe2baadd553a'),
(111, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDM1NzQ5NCwiaWF0IjoxNzQzNzUyNjk0LCJqdGkiOiJhNDg2ZDc5ODE2YmM0MjJjYWFlODc4OTFhZTMzOThiMyIsInVzZXJfaWQiOjN9.7_lg5aZPDpKjYQcuBi5TyT7vacplPEDI0lghYtP1jGc', '2025-04-04 07:44:54.687244', '2025-04-11 07:44:54.000000', 3, 'a486d79816bc422caae87891ae3398b3'),
(112, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDM2MTA2MSwiaWF0IjoxNzQzNzU2MjYxLCJqdGkiOiJlMjIyNTJiN2IzMjY0MTU2ODYyZTIyNWI4YWMxYmMyZSIsInVzZXJfaWQiOjF9.FhkdcZJhIm2oLIbPNau2D6Zeh9vjl0oqLw9LMPOHCaQ', '2025-04-04 08:44:21.681228', '2025-04-11 08:44:21.000000', 1, 'e22252b7b3264156862e225b8ac1bc2e'),
(113, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDM2NDgwMiwiaWF0IjoxNzQzNzYwMDAyLCJqdGkiOiJkODZhYTI0OWZkNmE0MzU2ODlhMzE0ZmU3OTkwNjJkMCIsInVzZXJfaWQiOjZ9.JtBv3YkeyIjqk2pVvFrE2t98av_Wm2Pf8yW-W-2hCO8', '2025-04-04 09:46:42.035196', '2025-04-11 09:46:42.000000', 6, 'd86aa249fd6a435689a314fe799062d0'),
(114, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDM2NDgyMSwiaWF0IjoxNzQzNzYwMDIxLCJqdGkiOiI0MzYyMTU3ZDc0MzA0ZDIzYjdmYmFmNTFmNTc5OGFhOCIsInVzZXJfaWQiOjF9.RH7QHKLucuhhxIdr0F_-k78aQM8C_jacaAjiG4sKixU', '2025-04-04 09:47:01.054228', '2025-04-11 09:47:01.000000', 1, '4362157d74304d23b7fbaf51f5798aa8'),
(115, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDYyMjI4OSwiaWF0IjoxNzQ0MDE3NDg5LCJqdGkiOiI4NjA2OTVhY2U1M2U0YzA3ODM0NDdiYTJjOGE4M2RiMyIsInVzZXJfaWQiOjZ9.jasZ9_wd8EfHoVW8Y0xTV1AtjZeOEBBZGT4A0fa1oG4', '2025-04-07 09:18:09.392530', '2025-04-14 09:18:09.000000', 6, '860695ace53e4c0783447ba2c8a83db3'),
(116, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDYyMjMyNSwiaWF0IjoxNzQ0MDE3NTI1LCJqdGkiOiI4NjZlZmFjNjkxODM0NGVmODc5YjFkOTE1NGVmM2E0YyIsInVzZXJfaWQiOjZ9.pOcig-lRJ-nuMrGBAwL4JQRnAyH5kuxmArjtn2hv-TE', '2025-04-07 09:18:45.277452', '2025-04-14 09:18:45.000000', 6, '866efac6918344ef879b1d9154ef3a4c'),
(117, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDYyMjMzNSwiaWF0IjoxNzQ0MDE3NTM1LCJqdGkiOiI4MDFmOTRmMjc2NGY0MDk1YmQyNjU3MjM5MGE5Mjk0OSIsInVzZXJfaWQiOjN9.mx9F-wHJNxHc2dN3voos-Aqp2dYLvtoSX7KvDW2xj3A', '2025-04-07 09:18:55.978904', '2025-04-14 09:18:55.000000', 3, '801f94f2764f4095bd26572390a92949'),
(118, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDY5NzQ3MywiaWF0IjoxNzQ0MDkyNjczLCJqdGkiOiJiOGZiMDQ4MWViZGU0OThjOGE4YzgzOWZjNmU4YmVhNSIsInVzZXJfaWQiOjF9.dTqmqiEfgMHJxSRTbjFxGCdp-oh45N-CYMKiKYJC9xI', '2025-04-08 06:11:13.127858', '2025-04-15 06:11:13.000000', 1, 'b8fb0481ebde498c8a8c839fc6e8bea5'),
(119, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDcwMTk1OSwiaWF0IjoxNzQ0MDk3MTU5LCJqdGkiOiI2OGM4ZTNhOTU0M2Y0ZjAxYmZiZjdiOTkwNGFmM2UzNyIsInVzZXJfaWQiOjF9.cOpZj04W6G8_zQ6XXJm99uUdXjJZR45plt74RqnrlkQ', '2025-04-08 07:25:59.463181', '2025-04-15 07:25:59.000000', 1, '68c8e3a9543f4f01bfbf7b9904af3e37'),
(120, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NDcwMzEyMCwiaWF0IjoxNzQ0MDk4MzIwLCJqdGkiOiI2NTc2YTI2ZGU3MTY0NDgzOTI3MmZkMDRmNDdjZDk5YiIsInVzZXJfaWQiOjN9.VMFF0hkGoyYdq9xD6sMM0qbhdYvvFfopRoF7F8H2C3Y', '2025-04-08 07:45:20.254619', '2025-04-15 07:45:20.000000', 3, '6576a26de71644839272fd04f47cd99b'),
(121, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NTkwOTI3MywiaWF0IjoxNzQ1MzA0NDczLCJqdGkiOiJhZDkxYmEwMTNiNmE0NDVjYjdkMzM3NzJlNTg3OGY0OSIsInVzZXJfaWQiOjF9.jzd0REdECkmdIZcUn5tzw3ktlC8ElYTX7queGRbaPjM', '2025-04-22 06:47:53.412391', '2025-04-29 06:47:53.000000', 1, 'ad91ba013b6a445cb7d33772e5878f49'),
(122, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NTkwOTg1MiwiaWF0IjoxNzQ1MzA1MDUyLCJqdGkiOiJjNjcyYjUyMzcwNGM0NTc4YjNhYjcyZjdmYTZlOTNiNCIsInVzZXJfaWQiOjF9.k5V4xNdpRQmec3rIt-1QFXcyVOI4roO8DcAlCiPsY-Y', '2025-04-22 06:57:32.475713', '2025-04-29 06:57:32.000000', 1, 'c672b523704c4578b3ab72f7fa6e93b4'),
(123, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NTkwOTg2OSwiaWF0IjoxNzQ1MzA1MDY5LCJqdGkiOiIwODEyNzMzZDc2ZDU0NzI4YmVmZTExNzNjYjViMGU0MiIsInVzZXJfaWQiOjN9.X_uDU3N-1PMgB0MetChXHV6Tyu27g1WBqfinUX7Gxdk', '2025-04-22 06:57:49.405267', '2025-04-29 06:57:49.000000', 3, '0812733d76d54728befe1173cb5b0e42'),
(124, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NTkxMTczMCwiaWF0IjoxNzQ1MzA2OTMwLCJqdGkiOiIxMTczMGFiNzFhMzA0MzFmOTgyZmZjNGIyOTA3ZjFlMSIsInVzZXJfaWQiOjN9.aWXH3TUhoYFcfgAco7MjjA7ri5rT24NuoqeSjXqeimU', '2025-04-22 07:28:50.350081', '2025-04-29 07:28:50.000000', 3, '11730ab71a30431f982ffc4b2907f1e1'),
(125, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NjA4MTc0NywiaWF0IjoxNzQ1NDc2OTQ3LCJqdGkiOiIzNmYzNmYwYzMyYjE0YmE0YWM2ZGU4YmU5MmRhYzMxNCIsInVzZXJfaWQiOjN9.xeHSNXOL5Engp3HuTwbUwvizm9iV8CT67rScBzAejVg', '2025-04-24 06:42:27.538727', '2025-05-01 06:42:27.000000', 3, '36f36f0c32b14ba4ac6de8be92dac314'),
(126, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NjA4NjY0NiwiaWF0IjoxNzQ1NDgxODQ2LCJqdGkiOiI0Y2E2YTEwZThiODY0MGNmYjYyNmViYzkzNWRiNGRmZCIsInVzZXJfaWQiOjN9.coCX-q3oNXPRAKUgMyJL345zmQZOhwSYzorInWp4d0A', '2025-04-24 08:04:06.328729', '2025-05-01 08:04:06.000000', 3, '4ca6a10e8b8640cfb626ebc935db4dfd'),
(127, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NjA5NDYyNSwiaWF0IjoxNzQ1NDg5ODI1LCJqdGkiOiIxZTVmNWJjN2UxZTM0MDgzYjg0YjEzNmUzYjVmYzc3OSIsInVzZXJfaWQiOjN9.ng_HoNNc8lLgoVGgGmHCPxAXsxCXlwmuyG27I7ukL3k', '2025-04-24 10:17:05.728014', '2025-05-01 10:17:05.000000', 3, '1e5f5bc7e1e34083b84b136e3b5fc779'),
(128, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NjA5OTYwNywiaWF0IjoxNzQ1NDk0ODA3LCJqdGkiOiJhNmFiOGNiMDJmOGI0MGU1OTVkM2Y2YmY5Yzg1N2EzZCIsInVzZXJfaWQiOjN9.6bMsP5ice9pzY1utgFX5jCR3szpcFYk4VNm8T3Ukryw', '2025-04-24 11:40:07.213078', '2025-05-01 11:40:07.000000', 3, 'a6ab8cb02f8b40e595d3f6bf9c857a3d'),
(129, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NjE3MDMxOCwiaWF0IjoxNzQ1NTY1NTE4LCJqdGkiOiI1N2UxMjZjNTIxMGM0ZTIyOGE4ZmZhNDVmZjU5YjY1NCIsInVzZXJfaWQiOjN9.qp6pdBHMLbwIEMbm_pI0PUt5RONyI9sdh8dO1-JQ1xU', '2025-04-25 07:18:38.404999', '2025-05-02 07:18:38.000000', 3, '57e126c5210c4e228a8ffa45ff59b654'),
(130, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NjQzMzQ4MiwiaWF0IjoxNzQ1ODI4NjgyLCJqdGkiOiI4MzNiZmRhODFiNWI0MTY3OWFiZTU4ZjU1MzMyNjc1MyIsInVzZXJfaWQiOjN9.WE8G-WWdboSILmIxluVGPOWqYq6T7MUfPjJ5RYboC3c', '2025-04-28 08:24:42.448623', '2025-05-05 08:24:42.000000', 3, '833bfda81b5b41679abe58f553326753'),
(131, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NjQ0MDYxOCwiaWF0IjoxNzQ1ODM1ODE4LCJqdGkiOiIwYzNhNGY3NmQyYWU0NDQ2OGNhNWZkY2Y0NjZiMGQ3MSIsInVzZXJfaWQiOjZ9.BVGbSzU1sU8wsauwaQ4GiUA9y54_j8ME9NpFbnP4bJ4', '2025-04-28 10:23:38.407392', '2025-05-05 10:23:38.000000', 6, '0c3a4f76d2ae44468ca5fdcf466b0d71'),
(132, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NjUxMzg5NiwiaWF0IjoxNzQ1OTA5MDk2LCJqdGkiOiI4OWE3ZDNlMmM1M2I0MTgyYmRiNjM4ZTQyZjU0MzUxZiIsInVzZXJfaWQiOjN9.ER6mgMdq4E6boJaW9g81FUzEXDo_gibK7w_pJZRB5Z0', '2025-04-29 06:44:56.666922', '2025-05-06 06:44:56.000000', 3, '89a7d3e2c53b4182bdb638e42f54351f'),
(133, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NzExNzQ5MywiaWF0IjoxNzQ2NTEyNjkzLCJqdGkiOiJjMmEwMmM0NzZiYTI0Mjc1Yjk2NDk5MjUwMDhmYTA0ZCIsInVzZXJfaWQiOjN9.lOFJzSybl68dCJADPKN9sQs36m7J4bEgaYP5aiQb07w', '2025-05-06 06:24:53.508386', '2025-05-13 06:24:53.000000', 3, 'c2a02c476ba24275b9649925008fa04d'),
(134, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NzI4OTc4NywiaWF0IjoxNzQ2Njg0OTg3LCJqdGkiOiIzYjZkMzNkZDQ3NmQ0MzJjOWUxNGQxMTZmN2VhZjQwYyIsInVzZXJfaWQiOjN9.PlfCi52n8Dmdj5vuLtIAL_XdSf3WrT7ZVSslCshsQWc', '2025-05-08 06:16:27.777179', '2025-05-15 06:16:27.000000', 3, '3b6d33dd476d432c9e14d116f7eaf40c'),
(135, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NzI4OTgwMCwiaWF0IjoxNzQ2Njg1MDAwLCJqdGkiOiI5MjhkODFhOWRkN2Y0NTRhOTVlNzY0OTAzZGUyZjYxMyIsInVzZXJfaWQiOjN9.fViGsQiaKlrNgSLDPZ5QLFhYuzxBWGGdF8vQHy3PojI', '2025-05-08 06:16:40.367985', '2025-05-15 06:16:40.000000', 3, '928d81a9dd7f454a95e764903de2f613'),
(136, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NzI4OTgwNiwiaWF0IjoxNzQ2Njg1MDA2LCJqdGkiOiJjZWRkNjM4MzIxNzM0ZDdkYjE2MTIxNWM2OTlmNzkzNiIsInVzZXJfaWQiOjN9.BOfLKKUA-Kk5KR57KVoka3JHEyUxDUiZ3V7pkq0MCM4', '2025-05-08 06:16:46.532135', '2025-05-15 06:16:46.000000', 3, 'cedd638321734d7db161215c699f7936'),
(137, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NzMwMTEzNywiaWF0IjoxNzQ2Njk2MzM3LCJqdGkiOiI5MjMwZGU2MzdhMTc0YmMwOWEzYWU5YjE3YWVjNjMyNyIsInVzZXJfaWQiOjZ9.GjsOpUMbzBtQpcWzsYx6y_6dqk8qzYDN9EP-VPFBda0', '2025-05-08 09:25:37.883611', '2025-05-15 09:25:37.000000', 6, '9230de637a174bc09a3ae9b17aec6327'),
(138, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NzMwMTIwNiwiaWF0IjoxNzQ2Njk2NDA2LCJqdGkiOiJhYTQ1NmY3NzBkNjU0NjdiOGFiYmI5N2NhNWMyZjA4NCIsInVzZXJfaWQiOjN9.SmllyIjcnheNGuSUaP6IrcF-OM7q8j6bc_ZDaD6eGb8', '2025-05-08 09:26:46.255951', '2025-05-15 09:26:46.000000', 3, 'aa456f770d65467b8abbb97ca5c2f084'),
(139, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NzM4NzY5MCwiaWF0IjoxNzQ2NzgyODkwLCJqdGkiOiIwYWYwZmE0ZTc3MjQ0MTM0ODViNGI4MmNiODBlODA5YiIsInVzZXJfaWQiOjN9.mZmMbLgXgF4ixrPrevOMsQdwHWTtUSkCMCtoXWKfHUE', '2025-05-09 09:28:10.827123', '2025-05-16 09:28:10.000000', 3, '0af0fa4e7724413485b4b82cb80e809b'),
(140, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0NzY0NjkwMiwiaWF0IjoxNzQ3MDQyMTAyLCJqdGkiOiI1OGFhNWVmNTI4ZGY0MzkxYTFiNGFkNTU1ZWNiOTg3NyIsInVzZXJfaWQiOjN9.eTYN2It4--GyHxVhvrqsXGWnyHd80jYa5jD8sJhxWYM', '2025-05-12 09:28:22.619935', '2025-05-19 09:28:22.000000', 3, '58aa5ef528df4391a1b4ad555ecb9877');

-- --------------------------------------------------------

--
-- Estructura de la taula `zonesreciclatge_contenedor`
--

CREATE TABLE `zonesreciclatge_contenedor` (
  `id` bigint(20) NOT NULL,
  `tipus` varchar(100) NOT NULL,
  `estat` varchar(100) NOT NULL,
  `latitud` double NOT NULL,
  `longitud` double NOT NULL,
  `ciutat` varchar(255) NOT NULL,
  `empresa_id` bigint(20) NOT NULL,
  `zona_id` bigint(20) DEFAULT NULL,
  `cod` varchar(255) NOT NULL,
  `alerta` tinyint(1) NOT NULL,
  `fecha_ultimo_vaciado` datetime(6) DEFAULT NULL,
  `motivo_alerta` varchar(255) DEFAULT NULL,
  `ultima_revision` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `zonesreciclatge_contenedor`
--

INSERT INTO `zonesreciclatge_contenedor` (`id`, `tipus`, `estat`, `latitud`, `longitud`, `ciutat`, `empresa_id`, `zona_id`, `cod`, `alerta`, `fecha_ultimo_vaciado`, `motivo_alerta`, `ultima_revision`) VALUES
(3, 'rebuig', 'ple', 41.676149366724005, 1.260037422180176, 'Cervera', 2, NULL, 'Cod02', 0, NULL, NULL, '2025-05-05 11:02:39.608890'),
(4, 'plàstic', 'mig', 41.6244308, 1.245396, 'Granyena', 1, NULL, 'Cod03', 0, NULL, NULL, '2025-05-05 11:02:39.608890'),
(5, 'paper', 'buit', 41.666853, 1.228019, 'la Curullada', 1, 5, 'Cod04', 0, NULL, NULL, '2025-05-05 11:02:39.608890'),
(6, 'paper', 'buit', 41.6730667, 1.2729426, 'Cervera', 1, 5, 'Cod01', 0, NULL, NULL, '2025-05-05 11:02:39.608890'),
(7, 'paper', 'buit', 41.62262881463783, 1.2452316284179688, 'Granyena de Segarra', 1, 7, 'Cod05', 0, NULL, NULL, '2025-05-05 11:02:39.608890'),
(8, 'paper', 'buit', 41.5983893, 1.347568, 'Pavia', 1, 5, 'Cod07', 0, NULL, NULL, '2025-05-05 11:02:39.608890'),
(10, 'paper', 'buit', 41.6300699, 0.8937291, 'Mollerussa', 1, NULL, 'Contenidor FerrerBusquets', 0, NULL, NULL, '2025-05-08 09:22:22.741425');

-- --------------------------------------------------------

--
-- Estructura de la taula `zonesreciclatge_historialcontenedor`
--

CREATE TABLE `zonesreciclatge_historialcontenedor` (
  `id` bigint(20) NOT NULL,
  `fecha` datetime(6) NOT NULL,
  `estado_anterior` varchar(100) NOT NULL,
  `estado_actual` varchar(100) NOT NULL,
  `nivel_llenado` int(11) DEFAULT NULL,
  `cambiado_por_id` bigint(20) DEFAULT NULL,
  `contenedor_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de la taula `zonesreciclatge_notificacion`
--

CREATE TABLE `zonesreciclatge_notificacion` (
  `id` bigint(20) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `mensaje` longtext NOT NULL,
  `fecha` datetime(6) NOT NULL,
  `leida` tinyint(1) NOT NULL,
  `relacion_contenedor_id` bigint(20) DEFAULT NULL,
  `relacion_zona_id` bigint(20) DEFAULT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `relacion_reporte_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `zonesreciclatge_notificacion`
--

INSERT INTO `zonesreciclatge_notificacion` (`id`, `tipo`, `titulo`, `mensaje`, `fecha`, `leida`, `relacion_contenedor_id`, `relacion_zona_id`, `usuario_id`, `relacion_reporte_id`) VALUES
(1, 'reporte', 'Nuevo reporte (Contenedor lleno)', 'asdf...', '2025-05-06 10:08:36.458395', 1, NULL, 5, 3, 1),
(2, 'reporte', 'Nuevo reporte (Contenedor lleno)', 'asdf...', '2025-05-06 10:08:36.459396', 0, NULL, 5, 5, 1),
(3, 'reporte', 'Nuevo reporte en Deixalleria de Cervera', 'Tipo: Contenedor lleno\nDescripción: asdf', '2025-05-06 10:08:36.461909', 0, NULL, 5, 5, 1),
(4, 'reporte', 'Nuevo reporte (Vandalismo)', 'y...', '2025-05-06 10:10:14.031820', 1, NULL, 5, 3, 2),
(5, 'reporte', 'Nuevo reporte (Vandalismo)', 'y...', '2025-05-06 10:10:14.033861', 0, NULL, 5, 5, 2),
(6, 'reporte', 'Nuevo reporte en Deixalleria de Cervera', 'Tipo: Vandalismo\nDescripción: y', '2025-05-06 10:10:14.038678', 0, NULL, 5, 5, 2),
(7, 'reporte', 'Nuevo reporte (Otro problema)', 'test de clics...', '2025-05-06 10:10:47.591591', 1, NULL, 5, 3, 3),
(8, 'reporte', 'Nuevo reporte (Otro problema)', 'test de clics...', '2025-05-06 10:10:47.592666', 0, NULL, 5, 5, 3),
(9, 'reporte', 'Nuevo reporte en Deixalleria de Cervera', 'Tipo: Otro problema\nDescripción: test de clics', '2025-05-06 10:10:47.594863', 0, NULL, 5, 5, 3),
(10, 'reporte', 'Nuevo reporte en Deixalleria de Cervera', 'Tipo: Vandalismo\nDescripción: test reports', '2025-05-06 10:13:45.735047', 0, NULL, 5, 5, 4),
(11, 'reporte', 'Reporte resuelto: Vandalisme', 'Tu reporte #4 ha sido marcado como resuelto', '2025-05-08 08:41:01.510618', 1, NULL, NULL, 3, 4),
(12, 'reporte', 'Reporte rebutjat: Altre problema', 'El teu tiquet #3 ha estat rebutjat.', '2025-05-08 08:41:27.112135', 1, NULL, NULL, 3, 3),
(13, 'reporte', 'Reporte resuelto: Vandalisme', 'Tu reporte #2 ha sido marcado como resuelto', '2025-05-08 08:46:25.096987', 1, NULL, NULL, 3, 2),
(14, 'reporte', 'Nuevo reporte (Mals olors)', 'Fa mals olors...', '2025-05-08 09:22:46.619328', 0, 10, NULL, 5, 5),
(15, 'reporte', 'Reporte resuelto: Mals olors', 'Tu reporte #5 ha sido marcado como resuelto', '2025-05-08 10:22:00.927322', 1, NULL, NULL, 3, 5),
(16, 'reporte', 'Reporte resuelto: Vandalisme', 'Tu reporte #4 ha sido marcado como resuelto', '2025-05-08 10:22:14.569547', 1, NULL, NULL, 3, 4),
(17, 'reporte', 'Reporte resuelto: Contenidor ple', 'Tu reporte #1 ha sido marcado como resuelto', '2025-05-08 10:28:06.214905', 0, NULL, NULL, 1, 1),
(18, 'reporte', 'Reporte rebutjat: Altre problema', 'El teu tiquet #3 ha estat rebutjat.', '2025-05-08 10:28:10.155908', 1, NULL, NULL, 3, 3),
(19, 'reporte', 'Reporte resuelto: Vandalisme', 'Tu reporte #2 ha sido marcado como resuelto', '2025-05-08 10:28:22.658016', 1, NULL, NULL, 3, 2);

-- --------------------------------------------------------

--
-- Estructura de la taula `zonesreciclatge_reportecontenedor`
--

CREATE TABLE `zonesreciclatge_reportecontenedor` (
  `id` bigint(20) NOT NULL,
  `fecha` datetime(6) NOT NULL,
  `ultima_actualizacion` datetime(6) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `prioridad` varchar(50) NOT NULL,
  `descripcion` longtext NOT NULL,
  `imagen` varchar(100) DEFAULT NULL,
  `estado` varchar(50) NOT NULL,
  `fecha_resolucion` datetime(6) DEFAULT NULL,
  `comentario_cierre` longtext DEFAULT NULL,
  `contenedor_id` bigint(20) DEFAULT NULL,
  `gestor_asignado_id` bigint(20) DEFAULT NULL,
  `resuelto_por_id` bigint(20) DEFAULT NULL,
  `usuario_id` bigint(20) DEFAULT NULL,
  `zona_id` bigint(20) DEFAULT NULL,
  `empresa_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `zonesreciclatge_reportecontenedor`
--

INSERT INTO `zonesreciclatge_reportecontenedor` (`id`, `fecha`, `ultima_actualizacion`, `tipo`, `prioridad`, `descripcion`, `imagen`, `estado`, `fecha_resolucion`, `comentario_cierre`, `contenedor_id`, `gestor_asignado_id`, `resuelto_por_id`, `usuario_id`, `zona_id`, `empresa_id`) VALUES
(1, '2025-05-06 10:08:36.454913', '2025-05-08 10:28:06.212904', 'lleno', 'urgente', 'asdf', '', 'resuelto', '2025-05-08 10:28:06.212904', '', NULL, NULL, 3, 1, 5, 1),
(2, '2025-05-06 10:10:14.030820', '2025-05-08 10:28:22.657011', 'vandalismo', 'baja', 'y', '', 'resuelto', '2025-05-08 08:46:25.093990', '', NULL, NULL, 3, 3, 5, 1),
(3, '2025-05-06 10:10:47.589591', '2025-05-08 10:28:10.152909', 'otro', 'alta', 'test de clics', '', 'rechazado', NULL, '', NULL, NULL, 3, 3, 5, 1),
(4, '2025-05-06 10:13:45.733013', '2025-05-08 11:49:25.967596', 'vandalismo', 'alta', 'test reports', '', 'en_proceso', '2025-05-08 08:41:01.507614', '', NULL, NULL, 3, 3, 5, 1),
(5, '2025-05-08 09:22:46.617295', '2025-05-09 07:32:17.645168', 'olores', 'urgente', 'Fa mals olors', '', 'en_proceso', '2025-05-08 10:22:00.924321', '', 10, NULL, 3, 3, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de la taula `zonesreciclatge_zonesreciclatge`
--

CREATE TABLE `zonesreciclatge_zonesreciclatge` (
  `id` bigint(20) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `ciutat` varchar(255) NOT NULL,
  `latitud` double NOT NULL,
  `longitud` double NOT NULL,
  `descripcio` longtext DEFAULT NULL,
  `empresa_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `zonesreciclatge_zonesreciclatge`
--

INSERT INTO `zonesreciclatge_zonesreciclatge` (`id`, `nom`, `ciutat`, `latitud`, `longitud`, `descripcio`, `empresa_id`) VALUES
(5, 'Deixalleria de Cervera', 'Cervera', 41.673611, 1.253311, 'es una deixalleria', 1),
(7, 'Deixalleria de Sant Guim', 'Sant Guim de Freixenet', 41.6575687, 1.4208056, 'Gang', 1);

--
-- Índexs per a les taules bolcades
--

--
-- Índexs per a la taula `accounts_customuser`
--
ALTER TABLE `accounts_customuser`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `accounts_customuser_email_4fd8e7ce_uniq` (`email`),
  ADD KEY `accounts_customuser_role_id_fb692466_fk_accounts_role_id` (`role_id`),
  ADD KEY `accounts_customuser_empresa_id_3fd0676e_fk_accounts_empresa_id` (`empresa_id`);

--
-- Índexs per a la taula `accounts_customuser_groups`
--
ALTER TABLE `accounts_customuser_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `accounts_customuser_groups_customuser_id_group_id_c074bdcb_uniq` (`customuser_id`,`group_id`),
  ADD KEY `accounts_customuser_groups_group_id_86ba5f9e_fk_auth_group_id` (`group_id`);

--
-- Índexs per a la taula `accounts_customuser_user_permissions`
--
ALTER TABLE `accounts_customuser_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `accounts_customuser_user_customuser_id_permission_9632a709_uniq` (`customuser_id`,`permission_id`),
  ADD KEY `accounts_customuser__permission_id_aea3d0e5_fk_auth_perm` (`permission_id`);

--
-- Índexs per a la taula `accounts_empresa`
--
ALTER TABLE `accounts_empresa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `NIF` (`NIF`);

--
-- Índexs per a la taula `accounts_role`
--
ALTER TABLE `accounts_role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Índexs per a la taula `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Índexs per a la taula `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Índexs per a la taula `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Índexs per a la taula `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_accounts_customuser_id` (`user_id`);

--
-- Índexs per a la taula `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Índexs per a la taula `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Índexs per a la taula `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Índexs per a la taula `token_blacklist_blacklistedtoken`
--
ALTER TABLE `token_blacklist_blacklistedtoken`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_id` (`token_id`);

--
-- Índexs per a la taula `token_blacklist_outstandingtoken`
--
ALTER TABLE `token_blacklist_outstandingtoken`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_blacklist_outstandingtoken_jti_hex_d9bdf6f7_uniq` (`jti`),
  ADD KEY `token_blacklist_outs_user_id_83bc629a_fk_accounts_` (`user_id`);

--
-- Índexs per a la taula `zonesreciclatge_contenedor`
--
ALTER TABLE `zonesreciclatge_contenedor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `zonesreciclatge_cont_empresa_id_9b44b9df_fk_accounts_` (`empresa_id`),
  ADD KEY `zonesreciclatge_cont_zona_id_dfbc1734_fk_zonesreci` (`zona_id`);

--
-- Índexs per a la taula `zonesreciclatge_historialcontenedor`
--
ALTER TABLE `zonesreciclatge_historialcontenedor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `zonesreciclatge_hist_cambiado_por_id_fdb46e31_fk_accounts_` (`cambiado_por_id`),
  ADD KEY `zonesrecicl_contene_b33d5a_idx` (`contenedor_id`,`fecha`);

--
-- Índexs per a la taula `zonesreciclatge_notificacion`
--
ALTER TABLE `zonesreciclatge_notificacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `zonesreciclatge_noti_relacion_contenedor__86c79995_fk_zonesreci` (`relacion_contenedor_id`),
  ADD KEY `zonesreciclatge_noti_relacion_zona_id_23f8688b_fk_zonesreci` (`relacion_zona_id`),
  ADD KEY `zonesreciclatge_noti_usuario_id_a29535a5_fk_accounts_` (`usuario_id`),
  ADD KEY `zonesreciclatge_noti_relacion_reporte_id_79c555df_fk_zonesreci` (`relacion_reporte_id`);

--
-- Índexs per a la taula `zonesreciclatge_reportecontenedor`
--
ALTER TABLE `zonesreciclatge_reportecontenedor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `zonesreciclatge_repo_contenedor_id_4be4dd1d_fk_zonesreci` (`contenedor_id`),
  ADD KEY `zonesreciclatge_repo_gestor_asignado_id_86371f28_fk_accounts_` (`gestor_asignado_id`),
  ADD KEY `zonesreciclatge_repo_resuelto_por_id_66600f25_fk_accounts_` (`resuelto_por_id`),
  ADD KEY `zonesreciclatge_repo_usuario_id_683c3bce_fk_accounts_` (`usuario_id`),
  ADD KEY `zonesreciclatge_repo_zona_id_71a6e1a3_fk_zonesreci` (`zona_id`),
  ADD KEY `zonesreciclatge_repo_empresa_id_466cff67_fk_accounts_` (`empresa_id`);

--
-- Índexs per a la taula `zonesreciclatge_zonesreciclatge`
--
ALTER TABLE `zonesreciclatge_zonesreciclatge`
  ADD PRIMARY KEY (`id`),
  ADD KEY `zonesreciclatge_zone_empresa_id_9fffbe34_fk_accounts_` (`empresa_id`);

--
-- AUTO_INCREMENT per les taules bolcades
--

--
-- AUTO_INCREMENT per la taula `accounts_customuser`
--
ALTER TABLE `accounts_customuser`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT per la taula `accounts_customuser_groups`
--
ALTER TABLE `accounts_customuser_groups`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la taula `accounts_customuser_user_permissions`
--
ALTER TABLE `accounts_customuser_user_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la taula `accounts_empresa`
--
ALTER TABLE `accounts_empresa`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la taula `accounts_role`
--
ALTER TABLE `accounts_role`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=246;

--
-- AUTO_INCREMENT per la taula `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la taula `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la taula `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT per la taula `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT per la taula `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT per la taula `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT per la taula `token_blacklist_blacklistedtoken`
--
ALTER TABLE `token_blacklist_blacklistedtoken`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT per la taula `token_blacklist_outstandingtoken`
--
ALTER TABLE `token_blacklist_outstandingtoken`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=141;

--
-- AUTO_INCREMENT per la taula `zonesreciclatge_contenedor`
--
ALTER TABLE `zonesreciclatge_contenedor`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT per la taula `zonesreciclatge_historialcontenedor`
--
ALTER TABLE `zonesreciclatge_historialcontenedor`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la taula `zonesreciclatge_notificacion`
--
ALTER TABLE `zonesreciclatge_notificacion`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT per la taula `zonesreciclatge_reportecontenedor`
--
ALTER TABLE `zonesreciclatge_reportecontenedor`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT per la taula `zonesreciclatge_zonesreciclatge`
--
ALTER TABLE `zonesreciclatge_zonesreciclatge`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restriccions per a les taules bolcades
--

--
-- Restriccions per a la taula `accounts_customuser`
--
ALTER TABLE `accounts_customuser`
  ADD CONSTRAINT `accounts_customuser_empresa_id_3fd0676e_fk_accounts_empresa_id` FOREIGN KEY (`empresa_id`) REFERENCES `accounts_empresa` (`id`),
  ADD CONSTRAINT `accounts_customuser_role_id_fb692466_fk_accounts_role_id` FOREIGN KEY (`role_id`) REFERENCES `accounts_role` (`id`);

--
-- Restriccions per a la taula `accounts_customuser_groups`
--
ALTER TABLE `accounts_customuser_groups`
  ADD CONSTRAINT `accounts_customuser__customuser_id_bc55088e_fk_accounts_` FOREIGN KEY (`customuser_id`) REFERENCES `accounts_customuser` (`id`),
  ADD CONSTRAINT `accounts_customuser_groups_group_id_86ba5f9e_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Restriccions per a la taula `accounts_customuser_user_permissions`
--
ALTER TABLE `accounts_customuser_user_permissions`
  ADD CONSTRAINT `accounts_customuser__customuser_id_0deaefae_fk_accounts_` FOREIGN KEY (`customuser_id`) REFERENCES `accounts_customuser` (`id`),
  ADD CONSTRAINT `accounts_customuser__permission_id_aea3d0e5_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`);

--
-- Restriccions per a la taula `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Restriccions per a la taula `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Restriccions per a la taula `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_accounts_customuser_id` FOREIGN KEY (`user_id`) REFERENCES `accounts_customuser` (`id`);

--
-- Restriccions per a la taula `token_blacklist_blacklistedtoken`
--
ALTER TABLE `token_blacklist_blacklistedtoken`
  ADD CONSTRAINT `token_blacklist_blacklistedtoken_token_id_3cc7fe56_fk` FOREIGN KEY (`token_id`) REFERENCES `token_blacklist_outstandingtoken` (`id`);

--
-- Restriccions per a la taula `token_blacklist_outstandingtoken`
--
ALTER TABLE `token_blacklist_outstandingtoken`
  ADD CONSTRAINT `token_blacklist_outs_user_id_83bc629a_fk_accounts_` FOREIGN KEY (`user_id`) REFERENCES `accounts_customuser` (`id`);

--
-- Restriccions per a la taula `zonesreciclatge_contenedor`
--
ALTER TABLE `zonesreciclatge_contenedor`
  ADD CONSTRAINT `zonesreciclatge_cont_empresa_id_9b44b9df_fk_accounts_` FOREIGN KEY (`empresa_id`) REFERENCES `accounts_empresa` (`id`),
  ADD CONSTRAINT `zonesreciclatge_cont_zona_id_dfbc1734_fk_zonesreci` FOREIGN KEY (`zona_id`) REFERENCES `zonesreciclatge_zonesreciclatge` (`id`);

--
-- Restriccions per a la taula `zonesreciclatge_historialcontenedor`
--
ALTER TABLE `zonesreciclatge_historialcontenedor`
  ADD CONSTRAINT `zonesreciclatge_hist_cambiado_por_id_fdb46e31_fk_accounts_` FOREIGN KEY (`cambiado_por_id`) REFERENCES `accounts_customuser` (`id`),
  ADD CONSTRAINT `zonesreciclatge_hist_contenedor_id_f623d845_fk_zonesreci` FOREIGN KEY (`contenedor_id`) REFERENCES `zonesreciclatge_contenedor` (`id`);

--
-- Restriccions per a la taula `zonesreciclatge_notificacion`
--
ALTER TABLE `zonesreciclatge_notificacion`
  ADD CONSTRAINT `zonesreciclatge_noti_relacion_contenedor__86c79995_fk_zonesreci` FOREIGN KEY (`relacion_contenedor_id`) REFERENCES `zonesreciclatge_contenedor` (`id`),
  ADD CONSTRAINT `zonesreciclatge_noti_relacion_reporte_id_79c555df_fk_zonesreci` FOREIGN KEY (`relacion_reporte_id`) REFERENCES `zonesreciclatge_reportecontenedor` (`id`),
  ADD CONSTRAINT `zonesreciclatge_noti_relacion_zona_id_23f8688b_fk_zonesreci` FOREIGN KEY (`relacion_zona_id`) REFERENCES `zonesreciclatge_zonesreciclatge` (`id`),
  ADD CONSTRAINT `zonesreciclatge_noti_usuario_id_a29535a5_fk_accounts_` FOREIGN KEY (`usuario_id`) REFERENCES `accounts_customuser` (`id`);

--
-- Restriccions per a la taula `zonesreciclatge_reportecontenedor`
--
ALTER TABLE `zonesreciclatge_reportecontenedor`
  ADD CONSTRAINT `zonesreciclatge_repo_contenedor_id_4be4dd1d_fk_zonesreci` FOREIGN KEY (`contenedor_id`) REFERENCES `zonesreciclatge_contenedor` (`id`),
  ADD CONSTRAINT `zonesreciclatge_repo_empresa_id_466cff67_fk_accounts_` FOREIGN KEY (`empresa_id`) REFERENCES `accounts_empresa` (`id`),
  ADD CONSTRAINT `zonesreciclatge_repo_gestor_asignado_id_86371f28_fk_accounts_` FOREIGN KEY (`gestor_asignado_id`) REFERENCES `accounts_customuser` (`id`),
  ADD CONSTRAINT `zonesreciclatge_repo_resuelto_por_id_66600f25_fk_accounts_` FOREIGN KEY (`resuelto_por_id`) REFERENCES `accounts_customuser` (`id`),
  ADD CONSTRAINT `zonesreciclatge_repo_usuario_id_683c3bce_fk_accounts_` FOREIGN KEY (`usuario_id`) REFERENCES `accounts_customuser` (`id`),
  ADD CONSTRAINT `zonesreciclatge_repo_zona_id_71a6e1a3_fk_zonesreci` FOREIGN KEY (`zona_id`) REFERENCES `zonesreciclatge_zonesreciclatge` (`id`);

--
-- Restriccions per a la taula `zonesreciclatge_zonesreciclatge`
--
ALTER TABLE `zonesreciclatge_zonesreciclatge`
  ADD CONSTRAINT `zonesreciclatge_zone_empresa_id_9fffbe34_fk_accounts_` FOREIGN KEY (`empresa_id`) REFERENCES `accounts_empresa` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
