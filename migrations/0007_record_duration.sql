-- Executar UMA VEZ no Cloudflare D1 oldarcade-stats-preview (NÃO produção).
-- Recordes antigos permanecem sem tempo (NULL); não inventar duração retroativa.
ALTER TABLE player_game_records ADD COLUMN duration_ms INTEGER CHECK (duration_ms IS NULL OR duration_ms >= 0);
CREATE INDEX IF NOT EXISTS idx_player_records_duration ON player_game_records (game,duration_ms ASC,achieved_at_ms ASC);
-- Conferência após execução: PRAGMA table_info('player_game_records');
