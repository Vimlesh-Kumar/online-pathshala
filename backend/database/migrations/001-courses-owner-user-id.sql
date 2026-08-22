-- 001 — add courses.owner_user_id so a course can point at its owning user.
-- Idempotent: the runner records each file as applied and never re-runs it, but
-- these guards also make the file safe to run by hand against an older database
-- that already went through the old ad-hoc bootstrap block.

-- Add the column only if it is missing.
SET @col := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'owner_user_id'
);
SET @sql := IF(@col = 0,
    'ALTER TABLE courses ADD COLUMN owner_user_id INT DEFAULT NULL',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add the foreign key only if it is missing.
SET @fk := (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses'
      AND CONSTRAINT_NAME = 'fk_courses_owner'
);
SET @sql := IF(@fk = 0,
    'ALTER TABLE courses ADD CONSTRAINT fk_courses_owner FOREIGN KEY (owner_user_id) REFERENCES users(id)',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Best-effort backfill from author display names for rows that predate the column.
UPDATE courses c JOIN users u ON u.full_name = c.author
SET c.owner_user_id = u.id
WHERE c.owner_user_id IS NULL;
