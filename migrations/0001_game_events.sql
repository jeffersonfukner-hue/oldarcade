-- Aplicar somente no banco D1 de Preview.
CREATE TABLE IF NOT EXISTS game_events(
 event_id TEXT PRIMARY KEY,
 game TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('visit','play')),
 recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_game_events_game_kind ON game_events(game,kind);
