-- Drop idx_app_name only when it exists (idempotent for fresh databases).
-- MySQL 8.0 does not support DROP INDEX IF EXISTS, so we use a prepared
-- statement driven by information_schema to make this migration re-runnable.
SET @exist := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE()
    AND table_name   = 'App'
    AND index_name   = 'idx_app_name'
);
SET @sql := IF(@exist > 0, 'ALTER TABLE App DROP INDEX idx_app_name', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
