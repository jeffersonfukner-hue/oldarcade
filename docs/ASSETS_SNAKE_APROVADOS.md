# Inventário — 12 imagens Snake aprovadas (20/11/2026)

**Estado verificado:** todas as 12 aprovadas e preparadas como arquivos PNG individuais, cópia byte a byte sem alterações; ZIP de entrega e manifest.json gerados e SHA-256 conferidos. **NENHUMA das 12 foi enviada ao GitHub pelo fluxo atual, nem aplicada ao site.** Os caminhos abaixo são destinos previstos, não arquivos já existentes. A conexão GitHub disponível não recebe o caminho de um PNG local para upload binário; a rede do ambiente de geração não resolve github.com. Não inventar commit de assets nem converter arquivos.

**ZIP de entrega:** `oldarcade-snake-12-imagens-aprovadas.zip` (23.261.031 bytes, SHA-256 `d0a1c21665f8d5689d24f4f4c9cf69aac69f97fb7fb921b82908b2093b2590fd`). Contém `manifest.json`, `README.md` e os 12 PNGs sob o caminho final da árvore. Disponível como anexo da conversa, não no GitHub.

| Item | Destino GitHub previsto | SHA-256 do original |
|---|---|---|
| 1. Capa principal | `public/images/games/snake-cover.png` | `e24e03a8c208a995288cfc955efa35238b74fb9bac66b5d7f995bfd2bf113e6f` |
| 2. História / Blockade 1976 | `public/images/history/snake/blockade-1976.png` | `a9c93ad23abaa14ec4a5154dcb70a5225bff6f6baf1367aa1286ad1e9eca8990` |
| 3. História / microcomputadores | `public/images/history/snake/home-computers-1980s.png` | `f1e5ecd71a8ccd1b43d8bc0b09f433706c2b5ccd8e2b13e25f4b3122b331a3d5` |
| 4. História / Nokia 1997 | `public/images/history/snake/nokia-1997.png` | `e7d57b12489728b4382743ecd87a19adf56dedb3f21659b164d5a2c00f0e90a8` |
| 5. História / celulares | `public/images/history/snake/mobile-2000s.png` | `ebba257b91916239998a88410b3939fcd6a0641afe65cbd3fc069ba30f2ee8c3` |
| 6. História / Snake Rewind | `public/images/history/snake/rewind-2015.png` | `752b3ff8a5cf10d84329662e3190b9092c6fea34ffac16123e95088d855dd3f2` |
| 7. História / Snake no navegador | `public/images/history/snake/browser-today.png` | `7b1e4f413c520cc5214fae2b7117771886a897d3aec1abe9450827883930c3df` |
| 8. Guia / como jogar | `public/images/editorial/snake/how-to-play.png` | `5aa9ed6bda00b7bea12304d44afd63b02dcefe36e529dc7c5f425779edbf2814` |
| 9. Guia / controles | `public/images/editorial/snake/controls.png` | `4be76a3759480bb9174aea5bff7fcf97f1e6b86a4433c68d459352dc5934d920` |
| 10. Guia / regras | `public/images/editorial/snake/rules.png` | `8fd84b28b609eda65d4196c9270726c6bb8dd6fd3aa76469ffc9f9d0d9a8566d` |
| 11. Modo / Aventura | `public/images/editorial/snake/adventure.png` | `c0fbd10215dfb6ae40ac968da5db764c4b847150389aa9f38526223f31244a88` |
| 12. Modo / Evolution | `public/images/editorial/snake/evolution.png` | `86c36867a8e04481365dbbb8b7f639a366a8786a4c4160c6dd95a727943e9601` |

## Inventário final de textos Snake — aplicação futura, sem alterar o site

- **Card da home/identidade:** capa aprovada (#1).
- **História:** Blockade, microcomputadores, Nokia 6110, novas versões para celular, Snake Rewind, Snake no navegador (#2–#7). As mesmas imagens poderão acompanhar as seções narrativas e a timeline sem duplicar arquivos.
- **Guia editorial do Clássico:** como jogar, controles, regras (#8–#10), reutilizáveis nos guias de Evolution quando o texto é idêntico.
- **Modos:** Aventura (#11), Evolution (#12), aplicáveis aos respectivos guias, quando apresentarem a mecânica verdadeira do jogo.
- **Desenvolvimento/versionamento:** artigos cronológicos já exibem história das versões; reaproveitar imagens específicas, sem produzir uma nova imagem para cada commit.
- **Rankings, conta, HUD, navegação, controles interativos e formulário:** nenhum asset editorial novo necessário, por não ser texto narrativo.
- **Lacunas reais para eventual lote complementar:** (a) o guia do **Aventura** explica separadamente *maçã dourada, cristal de gelo, fruta de velocidade e progressão das missões*; a imagem Aventura aprovada é geral e não demonstra visualmente esses itens; (b) **Evolution** tem recursos próprios (inimigos, frutas/poderes, tiros automáticos) que não estão necessariamente fiéis na arte geral — validar se uma ilustração de mecânicas reais merece criação; (c) **Man vs Snake / Nibbler** consta no texto sobre filmes relacionados e ainda não tem ilustração editorial própria; não copiar pôster/capa oficial sem direito de uso. Todas essas são **sugestões de imagens**, não ativos aprovados. Não inflar a produção com imagens repetidas sem valor.

**Critério de encerramento:** subir exatamente os PNGs, validar SHA-256 de cada arquivo após o upload, registrar o commit de inclusão, aguardar homologação dos demais títulos e só depois alterar as páginas do site com autorização. Sem merge ou deploy.
