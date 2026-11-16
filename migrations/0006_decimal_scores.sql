-- PREVIEW ONLY: oldarcade-stats-preview. Execute once after backup and record-count check.
-- Decimal scores use exact thousandths as INTEGER, never REAL.
-- Existing integer scores are multiplied by 1000 without rounding or data loss.
-- Do not run in production without explicit approval.
CREATE TABLE player_game_records_decimal (
 game TEXT NOT NULL,
 player_id TEXT NOT NULL REFERENCES player_accounts(id) ON DELETE CASCADE,
 best_score_milli INTEGER NOT NULL CHECK(best_score_milli >= 0),
 achieved_at_ms INTEGER NOT NULL,
 PRIMARY KEY(game,player_id)
);
INSERT INTO player_game_records_decimal(game,player_id,best_score_milli,achieved_at_ms)
 SELECT game,player_id,best_score * 1000,achieved_at_ms FROM player_game_records;
DROP TABLE player_game_records;
ALTER TABLE player_game_records_decimal RENAME TO player_game_records;
CREATE INDEX idx_player_game_records_ranking
 ON player_game_records(game,best_score_milli DESC,achieved_at_ms ASC,player_id ASC);
