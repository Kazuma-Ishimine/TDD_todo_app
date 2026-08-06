ALTER TABLE Todo
  ADD COLUMN parentId CHAR(36) NULL AFTER appId,
  ADD INDEX idx_todo_parent (appId, parentId),
  ADD CONSTRAINT fk_todo_parent FOREIGN KEY (parentId) REFERENCES Todo(id) ON DELETE SET NULL;
