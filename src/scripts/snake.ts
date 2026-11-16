type Direction = 'up'|'down'|'left'|'right';
type Point = {x:number;y:number};
type Score = {name:string;score:number;at:number};
const canvas = document.querySelector<HTMLCanvasElement>('#snake-canvas')!;
const ctx = canvas.getContext('2d')!;
const overlay = document.querySelector<HTMLElement>('#game-overlay')!;
const title = document.querySelector<HTMLElement>('#overlay-title')!;
const overlayText = document.querySelector<HTMLElement>('#overlay-text')!;
const startBtn = document.querySelector<HTMLButtonElement>('#start-btn')!;
const pauseBtn = document.querySelector<HTMLButtonElement>('#pause-btn')!;
const fullscreenBtn = document.querySelector<HTMLButtonElement>('#fullscreen-btn')!;
const stage = document.querySelector<HTMLElement>('#game-stage')!;
const hud = document.querySelector<HTMLElement>('#hud-status')!;
const countValue = document.querySelector<HTMLElement>('#countdown-value')!;
const size=20, cell=canvas.width/size;
const key='oldarcade:snake:v1';
type Saved={best:number;plays:number;visits:number;nickname:string;scores:Score[];lastVisit:string};
function read():Saved {try{const raw=JSON.parse(localStorage.getItem(key)||'{}');return {best:Number(raw.best)||0,plays:Number(raw.plays)||0,visits:Number(raw.visits)||0,nickname:String(raw.nickname||'').slice(0,18),scores:Array.isArray(raw.scores)?raw.scores.slice(0,20):[],lastVisit:String(raw.lastVisit||'')}}catch{return {best:0,plays:0,visits:0,nickname:'',scores:[],lastVisit:''}}}
let saved=read();
const sessionKey=key+':session';
try{if(!sessionStorage.getItem(sessionKey)){saved.visits++;sessionStorage.setItem(sessionKey,'1')}}catch{saved.visits++}
function store(){try{localStorage.setItem(key,JSON.stringify(saved))}catch{}}
store();
let snake:Point[]=[{x:7,y:10},{x:6,y:10},{x:5,y:10}];
let direction:Direction='right',next:Direction='right',food:Point={x:14,y:10},score=0;
let state:'ready'|'playing'|'paused'|'countdown'|'over'='ready',timer:number|undefined;
let countdownTimer:number|undefined;
let changingFullscreen=false;
let fallbackFullscreen=false;
let wasNativeFullscreen=false;
function setStatus(value:string){hud.textContent='● '+value}
function text(id:string,value:string){const el=document.getElementById(id);if(el)el.textContent=value}
function refresh(){text('score',String(score));text('best',String(saved.best));text('hud-score',String(score));text('hud-best',String(saved.best));text('plays',String(saved.plays));text('visits',String(saved.visits));const body=document.getElementById('rank-body')!;body.replaceChildren();if(!saved.scores.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=3;td.textContent='Jogue uma partida para registrar um resultado.';tr.append(td);body.append(tr)}else saved.scores.slice(0,10).forEach((entry,i)=>{const tr=document.createElement('tr');[String(i+1),entry.name,String(entry.score)].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td)});body.append(tr)})}
function draw(){ctx.fillStyle='#071a20';ctx.fillRect(0,0,600,600);ctx.strokeStyle='#122c32';ctx.lineWidth=1;for(let n=0;n<=size;n++){ctx.beginPath();ctx.moveTo(n*cell,0);ctx.lineTo(n*cell,600);ctx.moveTo(0,n*cell);ctx.lineTo(600,n*cell);ctx.stroke()}ctx.fillStyle='#ff657c';ctx.beginPath();ctx.arc(food.x*cell+cell/2,food.y*cell+cell/2,cell*.35,0,Math.PI*2);ctx.fill();snake.forEach((piece,i)=>{ctx.fillStyle=i===0?'#a0ffd0':'#46dca2';ctx.fillRect(piece.x*cell+2,piece.y*cell+2,cell-4,cell-4)});}
function placeFood(){const free:Point[]=[];for(let x=0;x<size;x++)for(let y=0;y<size;y++)if(!snake.some(p=>p.x===x&&p.y===y))free.push({x,y});if(!free.length){end(true);return}food=free[Math.floor(Math.random()*free.length)]}
function schedule(){window.clearTimeout(timer);if(state==='playing')timer=window.setTimeout(tick,Math.max(75,155-Math.floor(score/50)*8))}
function tick(){if(state!=='playing')return;direction=next;const delta:Record<Direction,Point>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};const d=delta[direction];const head={x:snake[0].x+d.x,y:snake[0].y+d.y};const eating=head.x===food.x&&head.y===food.y;const body=eating?snake:snake.slice(0,-1);if(head.x<0||head.x>=size||head.y<0||head.y>=size||body.some(p=>p.x===head.x&&p.y===head.y)){end(false);return}snake.unshift(head);if(eating){score+=10;placeFood();if(state!=='playing'){draw();return}}else snake.pop();draw();refresh();schedule()}
function cancelCountdown(){window.clearTimeout(countdownTimer);countValue.hidden=true;startBtn.hidden=false}
function show(headline:string,description:string,button:string){cancelCountdown();title.textContent=headline;overlayText.textContent=description;startBtn.textContent=button;overlay.hidden=false}
function start(){cancelCountdown();window.clearTimeout(timer);snake=[{x:7,y:10},{x:6,y:10},{x:5,y:10}];direction='right';next='right';score=0;food={x:14,y:10};state='playing';saved.plays++;store();overlay.hidden=true;pauseBtn.textContent='Pausar';setStatus('Jogando');draw();refresh();schedule()}
function end(won:boolean){state='over';setStatus(won?'Vitória':'Fim de jogo');window.clearTimeout(timer);if(score>saved.best)saved.best=score;saved.scores.push({name:saved.nickname||'Anônimo',score,at:Date.now()});saved.scores.sort((a,b)=>b.score-a.score||a.at-b.at);saved.scores=saved.scores.slice(0,20);store();refresh();show(won?'Tabuleiro completo!':'Fim de jogo',`Você marcou ${score} pontos. Que tal tentar novamente?`,'▶ Jogar novamente')}
function pause(){if(state==='playing'){state='paused';window.clearTimeout(timer);show('Jogo pausado','A partida está preservada.','▶ Continuar');setStatus('Pausado');pauseBtn.textContent='Continuar'}else if(state==='paused'){state='playing';overlay.hidden=true;pauseBtn.textContent='Pausar';setStatus('Jogando');schedule()}}
function turn(d:Direction){if(state!=='playing')return;const opposite:Record<Direction,Direction>={up:'down',down:'up',left:'right',right:'left'};if(d!==opposite[direction])next=d}

function beginCountdown(){
 cancelCountdown();window.clearTimeout(timer);
 state='countdown';setStatus('Preparando');
 title.textContent='Prepare-se';overlayText.textContent='A partida será retomada em:';
 overlay.hidden=false;startBtn.hidden=true;countValue.hidden=false;
 let remaining=3;
 function step(){
  countValue.textContent=String(remaining);setStatus('Retomando em '+remaining);
  if(remaining===1){
   countdownTimer=window.setTimeout(()=>{countValue.hidden=true;startBtn.hidden=false;overlay.hidden=true;state='playing';setStatus('Jogando');pauseBtn.textContent='Pausar';schedule()},1000);
  }else{remaining--;countdownTimer=window.setTimeout(step,1000)}
 }
 step();
}
// Restaura o foco visual do tabuleiro quando o navegador sai da tela cheia.
function centerGameAfterExit(){
 if(document.fullscreenElement===stage||fallbackFullscreen)return;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(document.fullscreenElement===stage||fallbackFullscreen)return;
  const board=document.querySelector<HTMLElement>('#game-screen')!;
  const rect=board.getBoundingClientRect();
  const target=window.scrollY+rect.top+(rect.height-window.innerHeight)/2;
  window.scrollTo({top:Math.max(0,target),behavior:'instant'});
 }));
}
function fullActive(){return document.fullscreenElement===stage||fallbackFullscreen}
function updateFullButton(){
 fullscreenBtn.textContent=fullActive()?'⤢ Sair da tela cheia (F)':'⛶ Tela cheia (F)';
 fullscreenBtn.setAttribute('aria-label',fullActive()?'Sair da tela cheia do jogo':'Ativar tela cheia do jogo');
}
async function toggleFullscreen(){
 if(changingFullscreen)return;
 changingFullscreen=true;
 const resume=state==='playing'||state==='countdown';
 if(resume){cancelCountdown();state='paused';window.clearTimeout(timer);setStatus('Pausado')}
 try{
  if(document.fullscreenElement===stage)await document.exitFullscreen();
  else if(fallbackFullscreen){fallbackFullscreen=false;stage.classList.remove('game-stage-fallback');document.body.classList.remove('game-fallback-active')}
  else {
   try{await stage.requestFullscreen()}
   catch{fallbackFullscreen=true;stage.classList.add('game-stage-fallback');document.body.classList.add('game-fallback-active')}
  }
 }finally{
  changingFullscreen=false;wasNativeFullscreen=document.fullscreenElement===stage;updateFullButton();
  if(!fullActive())centerGameAfterExit();
  if(resume)beginCountdown();
 }
}

startBtn.addEventListener('click',()=>state==='paused'?pause():start());
pauseBtn.addEventListener('click',pause);
document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(btn=>btn.addEventListener('click',()=>turn(btn.dataset.direction as Direction)));
window.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;const map:Record<string,Direction>={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};if(e.key.toLowerCase()==='f'&&!e.repeat&&!e.altKey&&!e.ctrlKey&&!e.metaKey){e.preventDefault();void toggleFullscreen()}else if(map[e.key]&&state==='playing'){e.preventDefault();turn(map[e.key])}else if(e.code==='Space'&&(state==='playing'||state==='paused')){e.preventDefault();pause()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause()});
fullscreenBtn.addEventListener('click',()=>{void toggleFullscreen()});
document.addEventListener('fullscreenchange',()=>{
 const nativeNow=document.fullscreenElement===stage;
 if(!changingFullscreen&&wasNativeFullscreen&&!nativeNow){
  centerGameAfterExit();
 }
 if(!changingFullscreen&&wasNativeFullscreen&&!nativeNow&&(state==='playing'||state==='countdown')){
  cancelCountdown();window.clearTimeout(timer);state='paused';beginCountdown();
 }
 wasNativeFullscreen=nativeNow;updateFullButton();
});
window.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&fallbackFullscreen){event.preventDefault();void toggleFullscreen()}
});
const form=document.querySelector<HTMLFormElement>('#nickname-form')!,nick=document.querySelector<HTMLInputElement>('#nickname')!;nick.value=saved.nickname;
form.addEventListener('submit',e=>{e.preventDefault();saved.nickname=nick.value.trim().replace(/[<>]/g,'').slice(0,18);store();text('nick-status',saved.nickname?'Nickname salvo apenas neste dispositivo.':'Nickname removido.');});
refresh();draw();
