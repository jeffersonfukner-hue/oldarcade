-- Somente no banco D1 oldarcade-stats-preview.
CREATE TABLE IF NOT EXISTS game_leaderboard (
 game TEXT NOT NULL,
 player_id TEXT NOT NULL,
 nickname TEXT NOT NULL,
 best_score INTEGER NOT NULL CHECK(best_score >= 0 AND best_score <= 4000 AND best_score % 10 = 0),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(game, player_id)
);
CREATE INDEX IF NOT EXISTS idx_game_leaderboard_score ON game_leaderboard(game,best_score DESC,updated_at ASC);
