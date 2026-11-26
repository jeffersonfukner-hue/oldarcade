/** Pontuação por eliminações simultâneas, independente do ranking legado. */
export const TETRIS_CLEAR_MULTIPLIERS=Object.freeze([0,1,2,4,8]);
export const TETRIS_CLEAR_BASE=100;
export function createTetrisClearStats(){return {counts:[0,0,0,0,0],lines:0,points:0};}
export function registerTetrisClear(stats,count){
 if(!Number.isInteger(count)||count<1||count>4)return 0;
 const points=TETRIS_CLEAR_BASE*TETRIS_CLEAR_MULTIPLIERS[count];
 stats.counts[count]++;
 stats.lines+=count;
 stats.points+=points;
 return points;
}
