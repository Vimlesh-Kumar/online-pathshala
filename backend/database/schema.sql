-- Online Pathshala — database schema (idempotent).
-- Safe to run repeatedly against any MySQL 8 database (local, Aiven, TiDB, ...).

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    full_name VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(500) NOT NULL,
    user_role ENUM('Student', 'Tutor', 'Admin') NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    author VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(6, 2),
    rating DECIMAL(4, 2),
    subtitle VARCHAR(500),
    thumb_url VARCHAR(255),
    title VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS wishlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content VARCHAR(100),
    rating INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tranaction_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL,
    total_paid DECIMAL(6, 2) NOT NULL,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS enrollment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOLEAN,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    progress DECIMAL(6, 2),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS lesson (
    id INT PRIMARY KEY AUTO_INCREMENT,
    duration VARCHAR(50),
    course_id INT NOT NULL,
    lesson_name VARCHAR(200),
    video_key VARCHAR(200),
    section_name VARCHAR(200),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS enroll_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    lesson_id INT NOT NULL,
    FOREIGN KEY (enrollment_id) REFERENCES enrollment(id),
    FOREIGN KEY (lesson_id) REFERENCES lesson(id)
);

CREATE TABLE IF NOT EXISTS course_objectives (
    id INT PRIMARY KEY AUTO_INCREMENT,
    objective VARCHAR(255),
    course_id INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
