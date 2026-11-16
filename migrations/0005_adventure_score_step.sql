-- Somente D1 Preview: oldarcade-stats-preview. Nunca executar em produção.
-- A versão 0004 restringiu best_score a múltiplos de 10, mas Aventura soma múltiplos de 5.
-- Recria a tabela sem excluir recordes existentes; conserva PK, FK e índice de ranking.
-- Aplicar com wrangler d1 migrations apply no banco de Preview após backup/inspeção.
CREATE TABLE player_game_records_v2 (
 game TEXT NOT NULL,
 player_id TEXT NOT NULL REFERENCES player_accounts(id) ON DELETE CASCADE,
 best_score INTEGER NOT NULL CHECK(best_score >= 0 AND best_score <= 4000 AND best_score % 5 = 0),
 achieved_at_ms INTEGER NOT NULL,
 PRIMARY KEY(game,player_id)
);
INSERT INTO player_game_records_v2(game,player_id,best_score,achieved_at_ms)
 SELECT game,player_id,best_score,achieved_at_ms FROM player_game_records;
DROP TABLE player_game_records;
ALTER TABLE player_game_records_v2 RENAME TO player_game_records;
CREATE INDEX idx_player_game_records_ranking
 ON player_game_records(game,best_score DESC,achieved_at_ms ASC,player_id ASC);
