-- OldArcade / somente D1 PREVIEW, após autorização do proprietário.
-- Etapa 0010: resultados objetivos de missões v2 (a partir de 19/11/2026).
-- Não apaga, altera ou reinicia tentativas anteriores; duas colunas NULLABLE
-- e uma coluna NULLABLE para sucesso da missão na mesma tabela existente.
ALTER TABLE daily_challenge_attempts ADD COLUMN lines_cleared INTEGER;
ALTER TABLE daily_challenge_attempts ADD COLUMN mission_success INTEGER;
-- Valores anteriores permanecem NULL = missão histórica sem avaliação.
-- Constraints/validação de números e vitória são aplicados na API.
