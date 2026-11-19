-- FUTURA MIGRAÇÃO: NÃO EXECUTAR sem autorização explícita do proprietário.
-- Cloudflare D1 Preview primeiro; produção somente após QA e autorização separada.
-- Única tentativa por conta, por jogo habilitado e por dia oficial (America/Sao_Paulo).
-- A restrição UNIQUE no servidor é o bloqueio real, independente de cache/sessão.
CREATE TABLE IF NOT EXISTS daily_challenge_attempts(
 game TEXT NOT NULL,
 challenge_date TEXT NOT NULL,
 player_id TEXT NOT NULL REFERENCES player_accounts(id) ON DELETE CASCADE,
 seed_version INTEGER NOT NULL,
 started_at_ms INTEGER NOT NULL,
 attempt_token_hash TEXT NOT NULL,
 finished_at_ms INTEGER,
 score INTEGER,
 duration_ms INTEGER,
 outcome TEXT NOT NULL DEFAULT 'started' CHECK(outcome IN ('started','finished')),
 PRIMARY KEY(game,challenge_date,player_id),
 CHECK((outcome='started' AND finished_at_ms IS NULL AND score IS NULL AND duration_ms IS NULL)
       OR (outcome='finished' AND finished_at_ms IS NOT NULL AND score IS NOT NULL AND score>=0
           AND duration_ms IS NOT NULL AND duration_ms>=0))
);
CREATE INDEX IF NOT EXISTS idx_daily_challenge_profile
 ON daily_challenge_attempts(player_id,challenge_date DESC,game);
