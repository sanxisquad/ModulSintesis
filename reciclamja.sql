-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Temps de generació: 26-03-2025 a les 18:50:47
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
(1, 'pbkdf2_sha256$870000$WO6gt7jMjxnkF4yliToWwc$oLZ1PW7yl56dKfdz80IdEdW8gS2vL58VSSga6FqjXnc=', '2025-03-25 10:13:22.667518', 1, 'sanxisquad', 'Marc', 'Sanchez Taseis', 'msancheztasies@gmail.com', 1, 1, '2025-03-06 11:00:40.000000', NULL, NULL, 1, 0, NULL, NULL),
(3, 'pbkdf2_sha256$870000$rIFtzo2UvMbdkW1k4DcWIa$CLeqBAokvHb91aOEpqynXdYtslr6u5zJ5+o+vWHsAxg=', NULL, 0, 'ccsegarra', 'Juan', 'Magan', 'cc@lasegarra.cat', 0, 1, '2025-03-10 10:36:11.000000', 14, 'Cervera', 3, 0, 1, '25200'),
(4, 'pbkdf2_sha256$870000$DLCmGcrUe8Nm3jAE1RhG6T$fN4KDBozXxWUec6ZpdCXLOeHipg0VzQd6xRrM/Hvwsg=', NULL, 0, 'ccplaurgell', 'Pla', 'Urgell', 'ccplaurgell@plaurgell.cat', 0, 1, '2025-03-24 10:36:02.424597', 17, 'Mollerussa', 3, 0, 2, NULL);

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
(1, 'ADMIN'),
(3, 'GESTOR'),
(2, 'USER');

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
(48, 'Can view zones reciclatge', 12, 'view_zonesreciclatge');

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
(18, '2025-03-25 10:15:06.249678', '2', 'CC Pla d\'Urgell', 2, '[{\"changed\": {\"fields\": [\"CP\"]}}]', 10, 1);

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
(37, 'accounts', '0005_empresa_cp', '2025-03-25 10:10:53.095728');

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
('z9vrjghhtx5g8y22uhwda7nb2cwzyagy', '.eJxVjEEOwiAQRe_C2hCgUKhL956BzAyDVA0kpV0Z765NutDtf-_9l4iwrSVunZc4J3EWWpx-NwR6cN1BukO9NUmtrsuMclfkQbu8tsTPy-H-HRTo5Vuz9kwWB6-sZT-SH3h0zhhrNVA2gTLkASwnE5xShNlhCAooTJh0nrx4fwDkFTgz:1trZUV:Cv8KALczf10KO0kcBmm39o9XsmJGO2tYmJpfrP3-kfQ', '2025-03-24 09:32:07.609924'),
('za10ofxb81k55rb8ustn9uw7oln7lqw7', '.eJxVjEEOwiAQRe_C2hCgUKhL956BzAyDVA0kpV0Z765NutDtf-_9l4iwrSVunZc4J3EWWpx-NwR6cN1BukO9NUmtrsuMclfkQbu8tsTPy-H-HRTo5Vuz9kwWB6-sZT-SH3h0zhhrNVA2gTLkASwnE5xShNlhCAooTJh0nrx4fwDkFTgz:1tx1He:7jUOylXaA_mAPIJjLWbIqWALCB6b_1art8mJz5K5yj4', '2025-04-08 10:13:22.669552');

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
(11, '2025-03-24 10:34:01.151360', 34);

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
(36, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc0MzUwMjI5OSwiaWF0IjoxNzQyODk3NDk5LCJqdGkiOiI5YWIzZTQ0Njg1MGE0YTZjYTU1M2Q1ZWQyZDNhNTkzZiIsInVzZXJfaWQiOjN9.O46Dvd4zq8Glei5gCwDVlwOm3t5fd46aewSrNZeDODU', '2025-03-25 10:11:39.038461', '2025-04-01 10:11:39.000000', 3, '9ab3e446850a4a6ca553d5ed2d3a593f');

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
  `cod` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Bolcament de dades per a la taula `zonesreciclatge_contenedor`
--

INSERT INTO `zonesreciclatge_contenedor` (`id`, `tipus`, `estat`, `latitud`, `longitud`, `ciutat`, `empresa_id`, `zona_id`, `cod`) VALUES
(3, 'rebuig', 'ple', 41.676149366724005, 1.260037422180176, 'Cervera', 1, NULL, 'Cod02'),
(4, 'plàstic', 'mig', 41.6244308, 1.245396, 'Granyena', 1, NULL, 'Cod03'),
(5, 'paper', 'buit', 41.666853, 1.228019, 'la Curullada', 1, 5, 'Cod04'),
(6, 'paper', 'buit', 41.6730667, 1.2729426, 'Cervera', 1, NULL, 'Cod01'),
(7, 'paper', 'buit', 41.62262881463783, 1.2452316284179688, 'Granyena de Segarra', 1, 5, 'Cod05'),
(8, 'paper', 'buit', 41.5983893, 1.347568, 'Pavia', 1, NULL, 'Cod07');

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
(5, 'Deixalleria', 'Cervera', 41.673611, 1.253311, 'es una deixalleria', 1);

--
-- Índexs per a les taules bolcades
--

--
-- Índexs per a la taula `accounts_customuser`
--
ALTER TABLE `accounts_customuser`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT per la taula `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT per la taula `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT per la taula `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT per la taula `token_blacklist_blacklistedtoken`
--
ALTER TABLE `token_blacklist_blacklistedtoken`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT per la taula `token_blacklist_outstandingtoken`
--
ALTER TABLE `token_blacklist_outstandingtoken`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT per la taula `zonesreciclatge_contenedor`
--
ALTER TABLE `zonesreciclatge_contenedor`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT per la taula `zonesreciclatge_zonesreciclatge`
--
ALTER TABLE `zonesreciclatge_zonesreciclatge`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
-- Restriccions per a la taula `zonesreciclatge_zonesreciclatge`
--
ALTER TABLE `zonesreciclatge_zonesreciclatge`
  ADD CONSTRAINT `zonesreciclatge_zone_empresa_id_9fffbe34_fk_accounts_` FOREIGN KEY (`empresa_id`) REFERENCES `accounts_empresa` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
