/**
 * Fonte única para a versão editorial do portal e seus marcos verificáveis.
 * package.json representa o número base do portal, e NÃO a versão dos jogos.
 * A marca -dev indica estágio de desenvolvimento; não é um lançamento.
 * Não apagar nem reescrever entradas históricas, acrescentar apenas fatos auditados.
 */
import packageData from '../../package.json';

export const portalVersion = `${packageData.version}-dev`;

export const portalMilestones = [
 {date:'2026-11-20',title:'O jogador ficou no centro da disputa',notes:'Ranking público para os sete modos e convite de cadastro em frente ao jogo, sem perder a partida ou trocar de página. O visual foi homologado durante os testes.',commit:'29704a14'},
 {date:'2026-11-19',title:'Um mundo para explorar, não só um placar',notes:'Pixel Quest entrou em desenvolvimento como terceiro jogo, com cenário lateral, cristais, inimigos e uma saída que depende da exploração completa da fase.',commit:'633e6f03'},
 {date:'2026-11-17',title:'O fliperama ganhou mais desafios',notes:'O Snake Evolution ganhou poderes, obstáculos, disparos automáticos e um ranking próprio na versão experimental.',commit:'3a4c7909'},
 {date:'2026-11-17',title:'O tabuleiro virou protagonista',notes:'O tabuleiro passou a ter mais espaço, com placar compacto e informações organizadas para desktop e celular.',commit:'ef402e3f'},
 {date:'2026-11-16',title:'Cada modo, seu próprio desafio',notes:'A estrutura de páginas, catálogo e integração editorial passou a atender jogos e modos de maneira reutilizável.',commit:'102503cf'}
] as const;

export const portalVersionHistory = [
 {version:'0.2.0-dev',date:'2026-11-16',notes:'Portal com catálogo de modalidades, conta e rankings; versão ainda em desenvolvimento.'},
 {version:'0.1.0',date:'2026-11-15',notes:'Primeira estrutura do OldArcade com Snake jogável e páginas institucionais.'}
] as const;

export const developmentCommitUrl = (sha:string)=>`https://github.com/jeffersonfukner-hue/oldarcade/commit/${encodeURIComponent(sha)}`;
