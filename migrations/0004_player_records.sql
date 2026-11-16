-- Executar somente no banco D1 oldarcade-stats-preview, uma única vez.
-- Os recordes legados permanecem em game_leaderboard e não são apagados.
CREATE TABLE IF NOT EXISTS player_game_records (
 game TEXT NOT NULL,
 player_id TEXT NOT NULL REFERENCES player_accounts(id) ON DELETE CASCADE,
 best_score INTEGER NOT NULL CHECK(best_score >= 0 AND best_score <= 4000 AND best_score % 10=0),
 achieved_at_ms INTEGER NOT NULL,
 PRIMARY KEY(game,player_id)
);
CREATE INDEX IF NOT EXISTS idx_player_game_records_ranking
 ON player_game_records(game,best_score DESC,achieved_at_ms ASC,player_id ASC);
ALTER TABLE player_accounts ADD COLUMN record_email_opt_in INTEGER NOT NULL DEFAULT 0
 CHECK(record_email_opt_in IN (0,1));
