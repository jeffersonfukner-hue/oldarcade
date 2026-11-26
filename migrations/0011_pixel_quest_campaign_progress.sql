-- Preparado para revisão: NÃO EXECUTAR sem autorização explícita no D1 Preview.
-- Nenhum dado de ranking legado é alterado.
CREATE TABLE IF NOT EXISTS player_campaign_progress (
 player_id TEXT NOT NULL REFERENCES player_accounts(id) ON DELETE CASCADE,
 game TEXT NOT NULL,
 unlocked_stage INTEGER NOT NULL CHECK(unlocked_stage BETWEEN 1 AND 4),
 completed_json TEXT NOT NULL DEFAULT '[]',
 updated_at_ms INTEGER NOT NULL CHECK(updated_at_ms > 0),
 PRIMARY KEY(player_id,game)
);
CREATE INDEX IF NOT EXISTS idx_campaign_progress_game ON player_campaign_progress(game,unlocked_stage);
