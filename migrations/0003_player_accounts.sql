-- Aplicar EXCLUSIVAMENTE no D1 oldarcade-stats-preview.
-- Contas independentes dos recordes recreativos existentes.
CREATE TABLE IF NOT EXISTS player_accounts (
 id TEXT PRIMARY KEY,
 nickname TEXT NOT NULL,
 nickname_key TEXT NOT NULL UNIQUE,
 email TEXT,
 email_verified INTEGER NOT NULL DEFAULT 0 CHECK(email_verified IN (0,1)),
 password_hash TEXT NOT NULL,
 password_salt TEXT NOT NULL,
 recovery_hash TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_player_accounts_email ON player_accounts(email);
CREATE TABLE IF NOT EXISTS player_sessions (
 token_hash TEXT PRIMARY KEY,
 player_id TEXT NOT NULL REFERENCES player_accounts(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_player_sessions_player ON player_sessions(player_id,expires_at);
CREATE TABLE IF NOT EXISTS player_login_attempts (
 nickname_key TEXT PRIMARY KEY,
 attempts INTEGER NOT NULL DEFAULT 0,
 window_until INTEGER NOT NULL DEFAULT 0
);
