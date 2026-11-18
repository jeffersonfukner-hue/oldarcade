import {DAILY_MODES} from '../data/dailyChallenges.js';
type DailyMission={version:number;kind:string;title:string;description:string;metric:string;target:number|null;timeLimitMs:number|null;sequence?:number[]};
type DailyProgress={game:string;score:number;linesCleared:number;durationMs:number;clearSequence:number[]};
type DayStatus={date:string;status:'started'|'finished';score?:number|null;durationMs?:number|null;missionSuccess?:boolean|null;version?:number};
type CalendarResponse={game:string;today:string;month:string;days:DayStatus[];account:{nickname:string}|null;historyAvailable?:boolean;error?:string;mission?:DailyMission|null};
const monthName=(month:string)=>new Date(month+'-15T12:00:00Z').toLocaleDateString('pt-BR',{month:'long',year:'numeric',timeZone:'UTC'});
const moveMonth=(month:string,step:number)=>{
 const [year,number]=month.split('-').map(Number);
 const next=new Date(Date.UTC(year,number-1+step,1));
 return next.toISOString().slice(0,7);
};
const monthDays=(month:string)=>{const [y,m]=month.split('-').map(Number);return {offset:new Date(Date.UTC(y,m-1,1)).getUTCDay(),days:new Date(Date.UTC(y,m,0)).getUTCDate()}}
for(const element of document.querySelectorAll<HTMLElement>('[data-daily-calendar]')){
 const game=element.dataset.dailyCalendar!;
 if(!Object.hasOwn(DAILY_MODES,game))continue;
 const days=element.querySelector<HTMLElement>('[data-daily-days]')!;
 const monthLabel=element.querySelector<HTMLElement>('[data-daily-month]')!;
 const info=element.querySelector<HTMLElement>('[data-daily-info]')!;
 const prev=element.querySelector<HTMLButtonElement>('[data-daily-previous]')!;
 const next=element.querySelector<HTMLButtonElement>('[data-daily-next]')!;
 const login=element.querySelector<HTMLAnchorElement>('[data-daily-login]')!;
 const start=element.querySelector<HTMLButtonElement>('[data-daily-start]')!;
 const done=element.querySelector<HTMLElement>('[data-daily-result]')!;
 const guestExplanation=element.querySelector<HTMLElement>('[data-daily-guest-explanation]')!;
 const stateBox=element.querySelector<HTMLElement>('[data-daily-status]')!;
 const stateTitle=element.querySelector<HTMLElement>('[data-daily-state-title]')!;
 const stateDescription=element.querySelector<HTMLElement>('[data-daily-state-description]')!;
 const brief=element.querySelector<HTMLElement>('[data-daily-mission-brief]')!;
 const briefTitle=element.querySelector<HTMLElement>('[data-daily-mission-name]')!;
 const briefRules=element.querySelector<HTMLElement>('[data-daily-mission-rules]')!;
 const sidebar=document.querySelector<HTMLElement>('[data-daily-mission-sidebar]');
 const tracker=sidebar?document.createElement('section'):null;
 if(tracker){tracker.className='daily-live-tracker';tracker.setAttribute('role','status');tracker.setAttribute('aria-label','Progresso da missão diária');tracker.hidden=true;sidebar!.prepend(tracker)}
 const drawTracker=(mission:DailyMission,progress:DailyProgress|null)=>{
  if(!tracker)return;
  tracker.replaceChildren();
  const eyebrow=document.createElement('span');eyebrow.className='eyebrow';eyebrow.textContent='🎯 MISSÃO DIÁRIA';
  const name=document.createElement('strong');name.textContent=mission.title;
  const detail=document.createElement('p');detail.textContent=mission.description;
  const value=mission.metric==='lines'?progress?.linesCleared??0:
   mission.metric==='duration'?Math.floor((progress?.durationMs??0)/1000):
   mission.metric==='quads'||mission.metric==='sequence'?progress?.clearSequence.length??0:progress?.score??0;
  const goal=mission.metric==='duration'?Math.ceil((mission.target??0)/1000):mission.target??0;
  const counter=document.createElement('div');counter.className='daily-live-progress';
  counter.textContent=mission.metric==='quads'?'Tetris completos: '+value+' / '+goal:
   mission.metric==='sequence'?'Sequência: '+value+' / '+goal+' etapas':
   mission.metric==='duration'?'Tempo sobrevivido: '+value+' / '+goal+' s':
   mission.metric==='lines'?'Linhas: '+value+' / '+goal:'Pontos: '+value+' / '+goal;
  tracker.append(eyebrow,name,detail,counter);
  if(mission.sequence){
   const seq=document.createElement('div');seq.className='daily-live-sequence';
   const cleared=progress?.clearSequence??[];
   for(const [i,n] of mission.sequence.entries()){
    const chip=document.createElement('span');chip.textContent=String(n);
    chip.className=i<cleared.length?'done':i===cleared.length?'next':'future';
    chip.setAttribute('aria-label','Passo '+(i+1)+': '+n+' linhas'+(i===cleared.length?', próximo':''));
    seq.append(chip);
   }
   tracker.append(seq);
   const next=mission.sequence[cleared.length];
   if(next!==undefined){const emphasis=document.createElement('div');emphasis.className='daily-live-next';emphasis.textContent='PRÓXIMA LIMPEZA: '+next+' LINHA'+(next===1?'':'S');tracker.append(emphasis)}
  }
  if(mission.kind==='quads'){const emphasis=document.createElement('div');emphasis.className='daily-live-next';emphasis.textContent='SOMENTE 4 LINHAS DE UMA VEZ!';tracker.append(emphasis)}
 };

 let enginePhase:'idle'|'playing'|'pending'|'finished'='idle';
 const setState=(kind:string,title:string,description:string)=>{stateBox.dataset.status=kind;stateTitle.textContent=title;stateDescription.textContent=description};
 let today='',month='',current:CalendarResponse|null=null,sequence=0;
 const render=(payload:CalendarResponse)=>{
  if(current&&payload.today!==current.today)enginePhase='idle';
  const statuses=new Map(payload.days.map(row=>[row.date,row.status]));
  const {offset,days:count}=monthDays(payload.month);
  const cells:HTMLElement[]=[];
  for(let i=0;i<offset;i++){const space=document.createElement('span');space.className='daily-day-spacer';space.setAttribute('aria-hidden','true');cells.push(space)}
  for(let i=1;i<=count;i++){
   const date=payload.month+'-'+String(i).padStart(2,'0');
   const participated=statuses.get(date)||(date===payload.today&&enginePhase!=='idle'?'started':undefined);
   const status=participated|| (date===payload.today?'today':date<payload.today?'past':'future');
   const button=document.createElement('button');button.type='button';button.disabled=!(date===payload.today&&!participated&&payload.month===payload.today.slice(0,7)&&payload.historyAvailable!==false);
   if(!button.disabled)button.addEventListener('click',()=>{if(payload.account){start.click()}else{guestExplanation.hidden=false;info.textContent='Crie uma conta gratuita para aproveitar este benefício e guardar sua participação.';document.dispatchEvent(new CustomEvent('oldarcade:open-auth'))}});
   button.className='daily-day';button.dataset.status=status;button.setAttribute('aria-label',date+' · '+(participated==='finished'?'concluído':participated==='started'?'tentativa utilizada':date===payload.today?'disponível hoje':date<payload.today?'encerrado':'ainda não disponível'));
   button.textContent=String(i);
   const detail=document.createElement('span');detail.className='daily-mark';
   detail.textContent=participated==='finished'?'✓':participated==='started'?'•':date===payload.today?'HOJE':'';
   button.append(detail);cells.push(button);
  }
  days.replaceChildren(...cells);
  today=payload.today;month=payload.month;current=payload;
  monthLabel.textContent=monthName(month);
  const mission=payload.mission;
  brief.hidden=!mission;
  if(mission){briefTitle.textContent=mission.title;briefRules.textContent=mission.description}
  if(tracker&&mission){drawTracker(mission,null);tracker.hidden=enginePhase==='idle'}
  const active=month===today.slice(0,7);
  const todayRow=payload.days.find(x=>x.date===today);
  const attempted=!!todayRow||enginePhase!=='idle';
  const currentMonth=active;
  login.hidden=!!payload.account;guestExplanation.hidden=true;start.hidden=!payload.account||!active||attempted||payload.historyAvailable===false;start.disabled=!payload.account||!active||attempted||payload.historyAvailable===false;
  done.hidden=!payload.account||!attempted;prev.disabled=false;next.disabled=month>=today.slice(0,7);
  if(payload.historyAvailable===false){
   setState('unavailable','Não foi possível verificar seu desafio','O histórico de tentativas está indisponível. Não sabemos se você já participou; iniciar fica bloqueado por segurança.');
   info.textContent=payload.error||'Não foi possível consultar a participação. Tente novamente mais tarde.';
  }else if(!payload.account){
   setState('guest','Desafio de hoje disponível para quem tem conta','É grátis: entre para registrar sua tentativa, sua pontuação e seu histórico.');
   info.textContent='Selecione o dia de hoje ou use o botão de entrada para participar.';
  }else if(enginePhase==='playing'){
   setState('playing','Desafio em andamento','Sua única tentativa está acontecendo no tabuleiro abaixo. Continue jogando para registrar a pontuação.');
   info.textContent='A partida está em andamento. Use os controles do jogo abaixo.';
  }else if(enginePhase==='pending'){
   setState('pending','Resultado aguardando confirmação','Sua partida terminou, mas a pontuação ainda precisa ser confirmada. Reenvie pelo botão do jogo.');
   info.textContent='Não inicie outra partida; utilize a opção de reenviar o resultado.';
  }else if(todayRow?.status==='finished'||enginePhase==='finished'){
   const result=typeof todayRow?.score==='number'?' Você marcou '+todayRow.score.toLocaleString('pt-BR')+' pontos.':'';
   const missionResult=todayRow?.missionSuccess===true?'🏆 META ATINGIDA!':todayRow?.missionSuccess===false?'Meta não alcançada.':'Desafio de hoje concluído';
   setState('finished',missionResult,result+' Sua tentativa foi registrada. Consulte o histórico em Minha Conta; o próximo desafio abre amanhã.');
   info.textContent='Participação concluída. Este desafio não pode ser repetido.';
  }else if(todayRow?.status==='started'){
   setState('started','Tentativa iniciada, sem conclusão confirmada','Este dia já teve uma tentativa reservada. Se a partida foi interrompida ou a página foi fechada, não é possível jogá-la novamente.');
   info.textContent='Nenhuma pontuação concluída foi confirmada para esta tentativa. O próximo desafio abre amanhã.';
  }else if(currentMonth){
   setState('available','Desafio de hoje disponível','Você ainda não iniciou sua tentativa. Uma vez iniciada, ela não poderá ser repetida.');
   info.textContent=mission?'Objetivo: '+mission.description:'Clique em Iniciar desafio de hoje.';
  }else{
   setState('past','Calendário de desafios anteriores','Datas anteriores são apenas para consulta. Volte ao mês atual para participar.');
   info.textContent='Selecione o mês atual para ver a disponibilidade do desafio de hoje.';
  }
 };
 const load=async(wanted?:string)=>{
  const seq=++sequence;
  info.textContent='Consultando o calendário e sua participação…';
  setState('loading','Verificando seu desafio…','Consultando sua participação no servidor.');
  prev.disabled=true;next.disabled=true;
  try{
   const url='/api/daily/'+encodeURIComponent(game)+(wanted?'?month='+encodeURIComponent(wanted):'');
   const response=await fetch(url,{cache:'no-store'});
   if(seq!==sequence)return;
   if(response.status===401){setState('guest','Entre para participar','A conta gratuita habilita os desafios e seu histórico.');days.replaceChildren();monthLabel.textContent='Desafio Diário';info.textContent='Entre na sua conta para jogar. Cada desafio permite somente uma tentativa por dia.';login.hidden=false;guestExplanation.hidden=false;start.hidden=true;done.hidden=true;return}
   const payload=await response.json() as CalendarResponse&{error?:string};
   if(!response.ok)throw Error(payload.error||'Não foi possível consultar os desafios.');
   render(payload);
  }catch(error){
   if(seq!==sequence)return;
   setState('unavailable','Não foi possível consultar o desafio','A disponibilidade não foi confirmada. Nenhuma tentativa será iniciada até a consulta voltar a funcionar.');
   monthLabel.textContent='Não foi possível carregar';
   days.replaceChildren();
   prev.disabled=true;next.disabled=true;
   info.textContent=(error instanceof Error?error.message:'Não foi possível carregar o calendário.')+' Atualize a página para tentar novamente.';
   start.hidden=true;done.hidden=true;login.hidden=true;guestExplanation.hidden=true;
  }
 };
 prev.addEventListener('click',()=>void load(moveMonth(month||today.slice(0,7),-1)));
 next.addEventListener('click',()=>{if(current&&moveMonth(month,1)<=today.slice(0,7))void load(moveMonth(month,1))});
 start.addEventListener('click',()=>{
  if(!current?.account||current.today!==today||current.month!==today.slice(0,7))return;
  start.disabled=true;
  // O motor executa o POST atômico. O calendário só solicita iniciar.
  document.dispatchEvent(new CustomEvent('oldarcade:daily-start-request',{detail:{game,date:today}}));
 });
 document.addEventListener('oldarcade:daily-progress',event=>{
  const progress=(event as CustomEvent<DailyProgress>).detail;
  if(progress?.game!==game||!current?.mission||!tracker)return;
  drawTracker(current.mission,progress);tracker.hidden=false;
 });
 document.addEventListener('oldarcade:daily-phase',event=>{
  const detail=(event as CustomEvent<{game:string;phase:'idle'|'playing'|'pending'|'finished'}>).detail;
  if(detail?.game!==game)return;
  enginePhase=detail.phase;
  const indicator=document.querySelector<HTMLElement>('[data-daily-play-indicator]');
  if(indicator)indicator.hidden=enginePhase!=='playing';
  if(tracker)tracker.hidden=enginePhase==='idle';
  if(current)render(current);
 });
 document.addEventListener('oldarcade:daily-status-changed',event=>{
  const data=(event as CustomEvent<{game:string}>).detail;
  if(data?.game===game)void load(month||undefined);
 });
 document.addEventListener('oldarcade:account-changed',()=>{enginePhase='idle';void load(month||undefined)});
 window.addEventListener('pageshow',event=>{if(event.persisted)void load(month||undefined)});
 void load();
}
