/** Pódio provisório calculado somente contra o retrato capturado no início da partida.
 * Empates não garantem ultrapassagem; servidor decide desempate na confirmação.
 */
export type RankingEntry={nickname?:string;score:number;rank?:number};
export type RankingSnapshot={available:boolean;top?:RankingEntry[];mine?:RankingEntry|null};
export type Milestone={kind:'personal'|'podium';rank?:1|2|3;scope:'fase'|'total';score:number};
export function podiumAtStart(score:number,board:RankingSnapshot|null):1|2|3|null{
 if(!board?.available||!board.top||!Number.isSafeInteger(score)||score<=0)return null;
 // A própria marca do jogador não pode ocupar um lugar à frente da nova tentativa.
 const others=board.mine?.nickname?board.top.filter(row=>row.nickname!==board.mine?.nickname):board.top;
 const ahead=others.filter(row=>!Number.isFinite(row.score)||row.score>=score).length;
 const rank=ahead+1;
 return rank<=3?rank as 1|2|3:null;
}
export function personalAtStart(score:number,board:RankingSnapshot|null,localBest:number|null):boolean{
 if(!Number.isSafeInteger(score)||score<=0)return false;
 if(board?.available&&!board.mine)return true;
 if(board?.available&&board.mine&&Number.isFinite(board.mine.score))return score>board.mine.score;
 return localBest!==null&&score>localBest;
}
export function verifiedRankMessage(provisional:1|2|3|null,confirmed:number|null):string{
 if(confirmed===null)return 'Posição ainda não confirmada no ranking. Consulte a classificação.';
 if(provisional!==null&&confirmed>provisional)
  return 'Você chegou ao '+provisional+'º lugar contra o ranking inicial, mas outro jogador ultrapassou sua marca. Posição atual: '+confirmed+'º.';
 if(provisional!==null&&confirmed===provisional)return 'Posição confirmada no ranking: '+confirmed+'º lugar!';
 if(confirmed<=3)return 'Ranking atualizado: '+confirmed+'º lugar confirmado!';
 return 'Resultado registrado. Posição atual: '+confirmed+'º.';
}
