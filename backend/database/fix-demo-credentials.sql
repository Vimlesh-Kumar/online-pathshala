-- One-off fix: reset the three demo accounts to the documented password (Test@1234).
-- Safe to run against any environment; only touches the demo rows and is idempotent.
INSERT INTO users (full_name, email, password, user_role) VALUES
  ('Test Admin',   'admin@test.com',   '$2b$10$tvyWXLNdUaSj68emJVYUF.4Eh65vsQbevgt/YtMNQJntnOqo5T/Gq', 'Admin'),
  ('Test Student', 'student@test.com', '$2b$10$2m7LHysaBoHokx4Fb0P16.DFJpaWJ3neJJOUQ7Wy8bfVriEKNGtjC', 'Student'),
  ('Test Tutor',   'tutor@test.com',   '$2b$10$pQb.FxTr2AGoZhzkQS9Q3eqPMrdsmRwFgHmbafR/1A/wgTsf34TxC', 'Tutor')
ON DUPLICATE KEY UPDATE
  password  = VALUES(password),
  full_name = VALUES(full_name),
  user_role = VALUES(user_role);
