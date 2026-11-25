-- Preparado para revisão. NÃO aplicar automaticamente. D1 Preview apenas após autorização.
CREATE TABLE IF NOT EXISTS tetris_rank_records (
 version INTEGER NOT NULL CHECK(version >= 2),
 scope TEXT NOT NULL,
 player_id TEXT NOT NULL REFERENCES player_accounts(id) ON DELETE CASCADE,
 points INTEGER NOT NULL CHECK(points >= 0),
 duration_ms INTEGER NOT NULL CHECK(duration_ms > 0),
 achieved_at_ms INTEGER NOT NULL,
 PRIMARY KEY(version,scope,player_id)
);
CREATE INDEX IF NOT EXISTS idx_tetris_rank_points ON tetris_rank_records(version,scope,points DESC,duration_ms ASC,achieved_at_ms ASC);
CREATE INDEX IF NOT EXISTS idx_tetris_rank_time ON tetris_rank_records(version,scope,duration_ms ASC,points DESC,achieved_at_ms ASC);
