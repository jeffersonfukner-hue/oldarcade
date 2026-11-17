-- OldArcade 0009 — Preferências de avisos por e-mail
-- Executar manualmente APENAS no D1 oldarcade-stats-preview, após 0008.
-- Preferências são apenas consentimento; não habilitam disparo de e-mails.
ALTER TABLE player_accounts ADD COLUMN daily_email_opt_in INTEGER NOT NULL DEFAULT 0 CHECK(daily_email_opt_in IN (0,1));
