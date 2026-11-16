/** Centraliza verticalmente o tabuleiro em telas menores sem tirar o jogador da partida. */
export function centerGameBoard(board:HTMLElement,stage:HTMLElement,blocked=()=>false){
 if(document.fullscreenElement===stage||blocked())return;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(document.fullscreenElement===stage||blocked())return;
  const rect=board.getBoundingClientRect();
  if(!rect.height)return;
  const y=window.scrollY+rect.top+(rect.height-window.innerHeight)/2;
  window.scrollTo({top:Math.max(0,y),behavior:'instant'});
 }));
}
