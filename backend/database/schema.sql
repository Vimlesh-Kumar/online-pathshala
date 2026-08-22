-- Online Pathshala — database schema (idempotent).
-- Safe to run repeatedly against any MySQL 8 database (local, Aiven, TiDB, ...).

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    full_name VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(500) NOT NULL,
    user_role ENUM('Student', 'Tutor', 'Admin') NOT NULL,
    avatar_url VARCHAR(500) DEFAULT NULL,
    headline VARCHAR(255) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    website_url VARCHAR(255) DEFAULT NULL,
    twitter_url VARCHAR(255) DEFAULT NULL,
    linkedin_url VARCHAR(255) DEFAULT NULL,
    github_url VARCHAR(255) DEFAULT NULL,
    youtube_url VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    address VARCHAR(255) DEFAULT NULL,
    gender VARCHAR(20) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    author VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(6, 2),
    rating DECIMAL(4, 2),
    subtitle VARCHAR(500),
    thumb_url VARCHAR(255),
    title VARCHAR(255),
    -- The tutor who created the course. `author` is only a display name, so it
    -- cannot be trusted for authorisation (announcements, edits, ...).
    owner_user_id INT DEFAULT NULL,
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
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

-- ── Engagement: Q&A ──
CREATE TABLE IF NOT EXISTS qna_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    content VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS qna_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    user_id INT NOT NULL,
    content VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES qna_questions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── Engagement: quizzes ──
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    question VARCHAR(500) NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    correct_option CHAR(1) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- ── Learning: timestamped lesson notes ──
CREATE TABLE IF NOT EXISTS lesson_notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    lesson_id INT NOT NULL,
    -- Playback position the note was captured at, in whole seconds.
    timestamp_seconds INT NOT NULL DEFAULT 0,
    content VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (lesson_id) REFERENCES lesson(id),
    INDEX idx_lesson_notes_user_course (user_id, course_id),
    INDEX idx_lesson_notes_user_updated (user_id, updated_at)
);

CREATE TABLE IF NOT EXISTS certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL UNIQUE,
    certificate_key VARCHAR(50) NOT NULL UNIQUE,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollment(id)
);

-- ── Learning: where the learner stopped watching each lesson ──
CREATE TABLE IF NOT EXISTS lesson_playback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    lesson_id INT NOT NULL,
    position_seconds INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_lesson_playback (user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (lesson_id) REFERENCES lesson(id),
    INDEX idx_lesson_playback_course (user_id, course_id)
);

-- ── Momentum: one row per learner per active day, for streaks and XP ──
CREATE TABLE IF NOT EXISTS learning_activity (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    activity_date DATE NOT NULL,
    lessons_completed INT NOT NULL DEFAULT 0,
    notes_taken INT NOT NULL DEFAULT 0,
    cards_reviewed INT NOT NULL DEFAULT 0,
    quizzes_taken INT NOT NULL DEFAULT 0,
    UNIQUE KEY uniq_learning_activity_day (user_id, activity_date),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── Instructor announcements, broadcast to everyone enrolled ──
CREATE TABLE IF NOT EXISTS course_announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_course_announcements_course (course_id, created_at)
);

-- ── In-app notifications ──
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(40) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body VARCHAR(500) DEFAULT NULL,
    -- In-app route the notification opens, e.g. /learn/42.
    link VARCHAR(255) DEFAULT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_notifications_user (user_id, is_read, created_at)
);

-- ── Flashcards: one deck per learner per course ──
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_flashcard_deck (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Cards carry their own SM-2 scheduling state: ease, interval and due date are
-- all the review algorithm needs, so no separate review-log table is required.
CREATE TABLE IF NOT EXISTS flashcards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    deck_id INT NOT NULL,
    user_id INT NOT NULL,
    lesson_id INT DEFAULT NULL,
    front VARCHAR(500) NOT NULL,
    back VARCHAR(1000) NOT NULL,
    -- Where the card came from: generated by AI, derived from a note, or hand-written.
    source VARCHAR(20) NOT NULL DEFAULT 'ai',
    ease_factor DECIMAL(4, 2) NOT NULL DEFAULT 2.50,
    interval_days INT NOT NULL DEFAULT 0,
    repetitions INT NOT NULL DEFAULT 0,
    lapses INT NOT NULL DEFAULT 0,
    due_on DATE NOT NULL,
    last_reviewed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deck_id) REFERENCES flashcard_decks(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lesson(id),
    INDEX idx_flashcards_due (user_id, due_on),
    INDEX idx_flashcards_deck (deck_id)
);

-- ── Practice: AI-generated question bank, cached per course/lesson ──
CREATE TABLE IF NOT EXISTS practice_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    lesson_id INT DEFAULT NULL,
    question VARCHAR(500) NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    correct_option CHAR(1) NOT NULL,
    explanation VARCHAR(500) DEFAULT NULL,
    -- Free-text label used to group results into "weak topics" after an attempt.
    topic VARCHAR(120) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (lesson_id) REFERENCES lesson(id),
    INDEX idx_practice_questions_scope (course_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS practice_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    lesson_id INT DEFAULT NULL,
    total INT NOT NULL,
    correct INT NOT NULL,
    score INT NOT NULL,
    -- Comma-separated topics the learner missed; kept denormalised for a cheap read.
    weak_topics VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (lesson_id) REFERENCES lesson(id),
    INDEX idx_practice_attempts_user (user_id, created_at)
);

-- ── Study goals: one weekly plan per learner ──
CREATE TABLE IF NOT EXISTS study_goals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    weekly_lessons INT NOT NULL DEFAULT 5,
    weekly_days INT NOT NULL DEFAULT 3,
    -- Planned weekdays as digits 0(Sun)-6(Sat), e.g. "1,3,5".
    plan_days VARCHAR(20) NOT NULL DEFAULT '1,3,5',
    reminders_on BOOLEAN NOT NULL DEFAULT TRUE,
    -- Guards the nudge notification so it is sent at most once a day.
    last_nudged_on DATE DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── Social: leaderboard visibility is opt-in per learner ──
CREATE TABLE IF NOT EXISTS learner_prefs (
    user_id INT PRIMARY KEY,
    leaderboard_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
    -- Optional public alias, so a learner can compete without showing their name.
    display_alias VARCHAR(50) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ── Social: head-to-head challenges between two learners ──
CREATE TABLE IF NOT EXISTS peer_challenges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    challenger_id INT NOT NULL,
    opponent_id INT NOT NULL,
    metric VARCHAR(20) NOT NULL DEFAULT 'lessons',
    starts_on DATE NOT NULL,
    ends_on DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- NULL once completed means the challenge ended in a draw.
    winner_user_id INT DEFAULT NULL,
    settled_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (challenger_id) REFERENCES users(id),
    FOREIGN KEY (opponent_id) REFERENCES users(id),
    INDEX idx_peer_challenges_challenger (challenger_id, status),
    INDEX idx_peer_challenges_opponent (opponent_id, status)
);
