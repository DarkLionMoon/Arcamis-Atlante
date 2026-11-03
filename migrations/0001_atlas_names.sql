CREATE TABLE atlas_names (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
  revision INTEGER NOT NULL DEFAULT 0,
  overrides TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT
);
INSERT INTO atlas_names(singleton) VALUES (1);
CREATE TABLE atlas_login_limits (
  bucket TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
