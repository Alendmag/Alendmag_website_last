-- ============================================================
-- Alendmag Website - MySQL Schema
-- Compatible with shared hosting (MySQL 5.7+)
-- Run once after creating the database
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

-- -------------------------
-- Admin / Team Members
-- -------------------------
CREATE TABLE IF NOT EXISTS `team_members` (
  `id`          CHAR(36)     NOT NULL,
  `name_ar`     VARCHAR(255) NOT NULL,
  `name_en`     VARCHAR(255) NOT NULL,
  `position_ar` VARCHAR(255) NOT NULL DEFAULT '',
  `position_en` VARCHAR(255) NOT NULL DEFAULT '',
  `photo_url`   TEXT,
  `image_url`   TEXT,
  `bio_ar`      TEXT,
  `bio_en`      TEXT,
  `order_index` INT          NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1)   NOT NULL DEFAULT 1,
  `is_admin`    TINYINT(1)   NOT NULL DEFAULT 0,
  `username`    VARCHAR(100),
  `password_hash` VARCHAR(255),
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_team_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- Products
-- -------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id`             CHAR(36)       NOT NULL,
  `name_ar`        VARCHAR(255)   NOT NULL,
  `name_en`        VARCHAR(255)   NOT NULL,
  `description_ar` TEXT,
  `description_en` TEXT,
  `price`          DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  `category`       VARCHAR(100)   NOT NULL DEFAULT '',
  `image_url`      TEXT,
  `is_active`      TINYINT(1)     NOT NULL DEFAULT 1,
  `created_at`     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- Clients
-- -------------------------
CREATE TABLE IF NOT EXISTS `clients` (
  `id`         CHAR(36)     NOT NULL,
  `name`       VARCHAR(255) NOT NULL,
  `email`      VARCHAR(255) NOT NULL,
  `phone`      VARCHAR(50),
  `company`    VARCHAR(255),
  `logo_url`   TEXT,
  `is_active`  TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_client_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- Orders
-- -------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id`             CHAR(36)      NOT NULL,
  `customer_name`  VARCHAR(255)  NOT NULL,
  `customer_email` VARCHAR(255)  NOT NULL,
  `customer_phone` VARCHAR(50)   NOT NULL,
  `product_id`     CHAR(36),
  `quantity`       INT           NOT NULL DEFAULT 1,
  `total_amount`   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status`         VARCHAR(20)   NOT NULL DEFAULT 'pending',
  `notes`          TEXT,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_orders_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- Projects
-- -------------------------
CREATE TABLE IF NOT EXISTS `projects` (
  `id`             CHAR(36)     NOT NULL,
  `title_ar`       VARCHAR(255) NOT NULL,
  `title_en`       VARCHAR(255) NOT NULL,
  `description_ar` TEXT,
  `description_en` TEXT,
  `client_id`      CHAR(36),
  `status`         VARCHAR(20)  NOT NULL DEFAULT 'pending',
  `progress`       INT          NOT NULL DEFAULT 0,
  `start_date`     DATE,
  `due_date`       DATE,
  `image_url`      TEXT,
  `technologies`   TEXT,
  `category_ar`    VARCHAR(255),
  `category_en`    VARCHAR(255),
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_projects_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- Project Tasks
-- -------------------------
CREATE TABLE IF NOT EXISTS `project_tasks` (
  `id`          CHAR(36)    NOT NULL,
  `project_id`  CHAR(36)    NOT NULL,
  `title`       VARCHAR(255) NOT NULL,
  `description` TEXT,
  `status`      VARCHAR(20)  NOT NULL DEFAULT 'pending',
  `assigned_to` CHAR(36),
  `priority`    VARCHAR(10)  NOT NULL DEFAULT 'medium',
  `due_date`    DATE,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tasks_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- Testimonials
-- -------------------------
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id`              CHAR(36)     NOT NULL,
  `client_name`     VARCHAR(255) NOT NULL,
  `client_position` VARCHAR(255),
  `client_company`  VARCHAR(255),
  `client_photo`    TEXT,
  `content_ar`      TEXT         NOT NULL,
  `content_en`      TEXT         NOT NULL,
  `rating`          INT          NOT NULL DEFAULT 5,
  `is_featured`     TINYINT(1)   NOT NULL DEFAULT 0,
  `is_active`       TINYINT(1)   NOT NULL DEFAULT 1,
  `order_index`     INT          NOT NULL DEFAULT 0,
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- FAQ
-- -------------------------
CREATE TABLE IF NOT EXISTS `faq` (
  `id`          CHAR(36)     NOT NULL,
  `question_ar` TEXT         NOT NULL,
  `question_en` TEXT         NOT NULL,
  `answer_ar`   TEXT         NOT NULL,
  `answer_en`   TEXT         NOT NULL,
  `category`    VARCHAR(100) NOT NULL DEFAULT 'general',
  `order_index` INT          NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- Blog Posts
-- -------------------------
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id`           CHAR(36)     NOT NULL,
  `title_ar`     VARCHAR(500) NOT NULL,
  `title_en`     VARCHAR(500) NOT NULL,
  `slug`         VARCHAR(500),
  `content_ar`   LONGTEXT     NOT NULL,
  `content_en`   LONGTEXT     NOT NULL,
  `excerpt_ar`   TEXT,
  `excerpt_en`   TEXT,
  `image_url`    TEXT,
  `author_id`    CHAR(36),
  `category`     VARCHAR(100) NOT NULL DEFAULT 'general',
  `tags`         TEXT,
  `is_published` TINYINT(1)   NOT NULL DEFAULT 0,
  `published_at` DATETIME,
  `view_count`   INT          NOT NULL DEFAULT 0,
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_blog_slug` (`slug`(255)),
  KEY `idx_blog_published` (`is_published`, `published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- Contact Messages
-- -------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id`          CHAR(36)     NOT NULL,
  `name`        VARCHAR(255) NOT NULL,
  `email`       VARCHAR(255) NOT NULL,
  `phone`       VARCHAR(50),
  `subject`     VARCHAR(500),
  `message`     TEXT         NOT NULL,
  `notes`       TEXT,
  `is_read`     TINYINT(1)   NOT NULL DEFAULT 0,
  `is_archived` TINYINT(1)   NOT NULL DEFAULT 0,
  `replied_at`  DATETIME,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- Support Tickets
-- -------------------------
CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id`            CHAR(36)     NOT NULL,
  `ticket_number` VARCHAR(20)  NOT NULL,
  `client_id`     CHAR(36),
  `name`          VARCHAR(255) NOT NULL,
  `email`         VARCHAR(255) NOT NULL,
  `subject`       VARCHAR(500) NOT NULL,
  `description`   TEXT         NOT NULL,
  `category`      VARCHAR(100) NOT NULL DEFAULT 'general',
  `priority`      VARCHAR(20)  NOT NULL DEFAULT 'medium',
  `status`        VARCHAR(20)  NOT NULL DEFAULT 'open',
  `assigned_to`   CHAR(36),
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_number` (`ticket_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- Ticket Replies
-- -------------------------
CREATE TABLE IF NOT EXISTS `ticket_replies` (
  `id`          CHAR(36)     NOT NULL,
  `ticket_id`   CHAR(36)     NOT NULL,
  `user_type`   VARCHAR(20)  NOT NULL DEFAULT 'admin',
  `user_id`     CHAR(36),
  `user_name`   VARCHAR(255) NOT NULL,
  `message`     TEXT         NOT NULL,
  `is_internal` TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_replies_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- Support Videos
-- -------------------------
CREATE TABLE IF NOT EXISTS `support_videos` (
  `id`             CHAR(36)     NOT NULL,
  `title_ar`       VARCHAR(500) NOT NULL,
  `title_en`       VARCHAR(500) NOT NULL,
  `description_ar` TEXT,
  `description_en` TEXT,
  `youtube_url`    TEXT         NOT NULL,
  `category`       VARCHAR(100) NOT NULL DEFAULT 'general',
  `order_index`    INT          NOT NULL DEFAULT 0,
  `is_active`      TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------
-- Site Settings
-- -------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id`            CHAR(36)     NOT NULL,
  `category`      VARCHAR(100) NOT NULL DEFAULT 'general',
  `setting_key`   VARCHAR(200) NOT NULL,
  `setting_value` TEXT,
  `setting_type`  VARCHAR(50)  NOT NULL DEFAULT 'text',
  `label_ar`      VARCHAR(500),
  `label_en`      VARCHAR(500),
  `order_index`   INT          NOT NULL DEFAULT 0,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET foreign_key_checks = 1;

-- ============================================================
-- Seed: Default Admin Account
-- Password: Admin@2025 (bcrypt hashed)
-- ============================================================
INSERT IGNORE INTO `team_members` (`id`, `name_ar`, `name_en`, `position_ar`, `position_en`, `is_active`, `is_admin`, `username`, `password_hash`, `order_index`)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'المدير',
  'Admin',
  'مدير النظام',
  'System Administrator',
  1,
  1,
  'admin',
  '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  0
);

-- ============================================================
-- Seed: Default Site Settings
-- ============================================================
INSERT IGNORE INTO `site_settings` (`id`, `category`, `setting_key`, `setting_value`, `setting_type`, `label_ar`, `label_en`, `order_index`) VALUES
  (UUID(), 'general',  'site_name_ar',        'الإندماج التقني',        'text',  'اسم الموقع بالعربية',       'Site Name (Arabic)',       1),
  (UUID(), 'general',  'site_name_en',        'Alendmag Tech',          'text',  'اسم الموقع بالإنجليزية',    'Site Name (English)',      2),
  (UUID(), 'general',  'site_description_ar', 'شركة متخصصة في تطوير البرمجيات', 'textarea', 'وصف الموقع بالعربية', 'Site Description (Arabic)', 3),
  (UUID(), 'general',  'site_description_en', 'Software development company', 'textarea', 'وصف الموقع بالإنجليزية', 'Site Description (English)', 4),
  (UUID(), 'general',  'logo_url',            '',                       'image', 'شعار الموقع',               'Site Logo',                5),
  (UUID(), 'contact',  'contact_email',       'info@alendmag.com',      'email', 'البريد الإلكتروني',          'Contact Email',            1),
  (UUID(), 'contact',  'contact_phone',       '+218920980096',          'text',  'رقم الهاتف',                'Phone Number',             2),
  (UUID(), 'contact',  'whatsapp_number',     '+218920980096',          'text',  'رقم واتساب',                'WhatsApp Number',          3),
  (UUID(), 'contact',  'contact_address_ar',  'طرابلس، ليبيا',          'text',  'العنوان بالعربية',           'Address (Arabic)',         4),
  (UUID(), 'contact',  'contact_address_en',  'Tripoli, Libya',         'text',  'العنوان بالإنجليزية',        'Address (English)',        5),
  (UUID(), 'social',   'social_facebook',     '',                       'url',   'فيسبوك',                    'Facebook',                 1),
  (UUID(), 'social',   'social_twitter',      '',                       'url',   'تويتر / X',                 'Twitter / X',              2),
  (UUID(), 'social',   'social_instagram',    '',                       'url',   'إنستغرام',                  'Instagram',                3),
  (UUID(), 'social',   'social_linkedin',     '',                       'url',   'لينكد إن',                  'LinkedIn',                 4),
  (UUID(), 'social',   'social_youtube',      '',                       'url',   'يوتيوب',                    'YouTube',                  5),
  (UUID(), 'hero',     'stats_projects',      '150+',                   'text',  'عدد المشاريع',              'Projects Count',           1),
  (UUID(), 'hero',     'stats_experience',    '10+',                    'text',  'سنوات الخبرة',              'Years of Experience',      2),
  (UUID(), 'hero',     'stats_satisfaction',  '98%',                    'text',  'رضا العملاء',               'Client Satisfaction',      3);
