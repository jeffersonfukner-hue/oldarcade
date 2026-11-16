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
let state:'ready'|'playing'|'paused'|'over'='ready',timer:number|undefined;
function text(id:string,value:string){const el=document.getElementById(id);if(el)el.textContent=value}
function refresh(){text('score',String(score));text('best',String(saved.best));text('plays',String(saved.plays));text('visits',String(saved.visits));const body=document.getElementById('rank-body')!;body.replaceChildren();if(!saved.scores.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=3;td.textContent='Jogue uma partida para registrar um resultado.';tr.append(td);body.append(tr)}else saved.scores.slice(0,10).forEach((entry,i)=>{const tr=document.createElement('tr');[String(i+1),entry.name,String(entry.score)].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td)});body.append(tr)})}
function draw(){ctx.fillStyle='#071a20';ctx.fillRect(0,0,600,600);ctx.strokeStyle='#122c32';ctx.lineWidth=1;for(let n=0;n<=size;n++){ctx.beginPath();ctx.moveTo(n*cell,0);ctx.lineTo(n*cell,600);ctx.moveTo(0,n*cell);ctx.lineTo(600,n*cell);ctx.stroke()}ctx.fillStyle='#ff657c';ctx.beginPath();ctx.arc(food.x*cell+cell/2,food.y*cell+cell/2,cell*.35,0,Math.PI*2);ctx.fill();snake.forEach((piece,i)=>{ctx.fillStyle=i===0?'#a0ffd0':'#46dca2';ctx.fillRect(piece.x*cell+2,piece.y*cell+2,cell-4,cell-4)});}
function placeFood(){const free:Point[]=[];for(let x=0;x<size;x++)for(let y=0;y<size;y++)if(!snake.some(p=>p.x===x&&p.y===y))free.push({x,y});if(!free.length){end(true);return}food=free[Math.floor(Math.random()*free.length)]}
function schedule(){window.clearTimeout(timer);if(state==='playing')timer=window.setTimeout(tick,Math.max(75,155-Math.floor(score/50)*8))}
function tick(){if(state!=='playing')return;direction=next;const delta:Record<Direction,Point>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};const d=delta[direction];const head={x:snake[0].x+d.x,y:snake[0].y+d.y};const eating=head.x===food.x&&head.y===food.y;const body=eating?snake:snake.slice(0,-1);if(head.x<0||head.x>=size||head.y<0||head.y>=size||body.some(p=>p.x===head.x&&p.y===head.y)){end(false);return}snake.unshift(head);if(eating){score+=10;placeFood()}else snake.pop();draw();refresh();schedule()}
function show(headline:string,description:string,button:string){title.textContent=headline;overlayText.textContent=description;startBtn.textContent=button;overlay.hidden=false}
function start(){window.clearTimeout(timer);snake=[{x:7,y:10},{x:6,y:10},{x:5,y:10}];direction='right';next='right';score=0;food={x:14,y:10};state='playing';saved.plays++;store();overlay.hidden=true;pauseBtn.textContent='Pausar';draw();refresh();schedule()}
function end(won:boolean){state='over';window.clearTimeout(timer);if(score>saved.best)saved.best=score;saved.scores.push({name:saved.nickname||'Anônimo',score,at:Date.now()});saved.scores.sort((a,b)=>b.score-a.score||a.at-b.at);saved.scores=saved.scores.slice(0,20);store();refresh();show(won?'Tabuleiro completo!':'Fim de jogo',`Você marcou ${score} pontos. Que tal tentar novamente?`,'▶ Jogar novamente')}
function pause(){if(state==='playing'){state='paused';window.clearTimeout(timer);show('Jogo pausado','A partida está preservada.','▶ Continuar');pauseBtn.textContent='Continuar'}else if(state==='paused'){state='playing';overlay.hidden=true;pauseBtn.textContent='Pausar';schedule()}}
function turn(d:Direction){if(state!=='playing')return;const opposite:Record<Direction,Direction>={up:'down',down:'up',left:'right',right:'left'};if(d!==opposite[direction])next=d}
startBtn.addEventListener('click',()=>state==='paused'?pause():start());
pauseBtn.addEventListener('click',pause);
document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(btn=>btn.addEventListener('click',()=>turn(btn.dataset.direction as Direction)));
window.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;const map:Record<string,Direction>={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};if(map[e.key]&&state==='playing'){e.preventDefault();turn(map[e.key])}else if(e.code==='Space'&&(state==='playing'||state==='paused')){e.preventDefault();pause()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause()});
fullscreenBtn.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await stage.requestFullscreen()}catch{fullscreenBtn.title='Tela cheia não disponível neste navegador'}});
document.addEventListener('fullscreenchange',()=>{fullscreenBtn.textContent=document.fullscreenElement?'⤢ Sair da tela cheia':'⛶ Tela cheia'});
const form=document.querySelector<HTMLFormElement>('#nickname-form')!,nick=document.querySelector<HTMLInputElement>('#nickname')!;nick.value=saved.nickname;
form.addEventListener('submit',e=>{e.preventDefault();saved.nickname=nick.value.trim().replace(/[<>]/g,'').slice(0,18);store();text('nick-status',saved.nickname?'Nickname salvo apenas neste dispositivo.':'Nickname removido.');});
refresh();draw();
