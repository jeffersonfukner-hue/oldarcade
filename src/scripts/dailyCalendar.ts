import {DAILY_MODES,dailyMission,dailySeed} from '../data/dailyChallenges.js';
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
 const previewHost=location.hostname==='oldarcade-17c.pages.dev'||location.hostname.endsWith('.oldarcade-17c.pages.dev');
 const lab=element.querySelector<HTMLElement>('[data-daily-preview-lab]')!;
 const nextLab=element.querySelector<HTMLButtonElement>('[data-daily-preview-next]')!;
 const startLab=element.querySelector<HTMLButtonElement>('[data-daily-preview-start]')!;
 if(previewHost)lab.hidden=false;
 let previewOffset=0,practiceMission:DailyMission|null=null,practiceRunning=false;
 const practiceDate=()=>new Date(Date.parse('2026-11-20T12:00:00Z')+previewOffset*86400000).toISOString().slice(0,10);
 const sidebar=document.querySelector<HTMLElement>('[data-daily-mission-sidebar]');
 const tracker=sidebar?document.createElement('section'):null;
 if(tracker){tracker.className='daily-live-tracker';tracker.setAttribute('role','status');tracker.setAttribute('aria-label','Progresso da missão diária');tracker.hidden=true;sidebar!.append(tracker);if(sidebar!.hasAttribute('data-daily-mission-inline'))sidebar!.hidden=true}
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
  counter.textContent=mission.metric==='quadscore'?'Pontos só com 4 linhas: '+value+' / '+goal:
   mission.metric==='sequence'?'Sequência: '+value+' / '+goal+' etapas':
   mission.metric==='duration'?'Tempo sobrevivido: '+value+' / '+goal+' s':
   mission.metric==='lines'?'Linhas: '+value+' / '+goal:mission.metric==='score'?'Frutas: '+Math.floor(value/10)+' / '+Math.floor(goal/10):'Pontos: '+value+' / '+goal;
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
 let today='',month='',selectedDate='',current:CalendarResponse|null=null,sequence=0;
 const showPracticeMission=()=>{
  if(!previewHost)return;
  const date=practiceDate();
  const mission=dailyMission(game,date,3) as DailyMission|null;
  if(!mission)return;
  practiceMission=mission;
  brief.hidden=false;briefTitle.textContent='TESTE LIVRE · '+mission.title;briefRules.textContent=mission.description;
  if(tracker){drawTracker(mission,null);tracker.hidden=false;if(sidebar)sidebar.hidden=false}
  nextLab.disabled=practiceRunning;
  startLab.disabled=practiceRunning;
  startLab.textContent=practiceRunning?'▶ Missão em andamento':'▶ Jogar missão de teste';
 };
 if(previewHost){
  nextLab.addEventListener('click',()=>{
   if(practiceRunning)return;
   previewOffset++;
   showPracticeMission();
  });
  startLab.addEventListener('click',()=>{
   if(practiceRunning||!practiceMission)return;
   practiceRunning=true;showPracticeMission();
   document.dispatchEvent(new CustomEvent('oldarcade:daily-practice-start',{
    detail:{game,date:practiceDate(),mission:practiceMission,seed:dailySeed(game,practiceDate(),3)}
   }));
  });
  showPracticeMission();
 }
 const render=(payload:CalendarResponse)=>{
  if(current&&payload.today!==current.today)enginePhase='idle';
  const statuses=new Map(payload.days.map(row=>[row.date,row.status]));
  const {offset,days:count}=monthDays(payload.month);
  const cells:HTMLElement[]=[];
  for(let i=0;i<offset;i++){const space=document.createElement('span');space.className='daily-day-spacer';space.setAttribute('aria-hidden','true');cells.push(space)}
  for(let i=1;i<=count;i++){
   const date=payload.month+'-'+String(i).padStart(2,'0');
   const participated=statuses.get(date)||(date===payload.today&&enginePhase!=='idle'?'started':undefined);
   const claimable=!!payload.account&&payload.historyAvailable!==false&&
    (date===payload.today&&!participated||participated==='started');
   const status=participated==='started'?'available':participated|| (date===payload.today?'today':date<payload.today?'past':'future');
   const button=document.createElement('button');button.type='button';button.disabled=!claimable;
   if(!button.disabled)button.addEventListener('click',()=>{
    selectedDate=date;
    render(payload);
    start.focus({preventScroll:true});
   });
   button.className='daily-day';button.dataset.status=status;
   button.setAttribute('aria-label',date+' · '+(participated==='finished'?'missão concluída':participated==='started'?'missão pendente, continuar':date===payload.today?'missão de hoje disponível':date<payload.today?'não recebida':'ainda não disponível'));
   button.textContent=String(i);
   const detail=document.createElement('span');detail.className='daily-mark';
   detail.textContent=participated==='finished'?'✓':participated==='started'?'JOGAR':date===payload.today?'HOJE':'';
   button.append(detail);cells.push(button);
  }
  days.replaceChildren(...cells);
  today=payload.today;month=payload.month;current=payload;
  monthLabel.textContent=monthName(month);
  if(!selectedDate||!selectedDate.startsWith(month))selectedDate=payload.today.startsWith(month)?payload.today:'';
  const selectedRow=payload.days.find(x=>x.date===selectedDate);
  const hasMission=selectedDate===payload.today||selectedRow?.status==='started';
  const mission=hasMission?(selectedDate===payload.today?payload.mission:dailyMission(game,selectedDate,selectedRow?.version)):null;
  brief.hidden=!mission;
  if(mission&&!previewHost){briefTitle.textContent=mission.title;briefRules.textContent=mission.description}
  if(tracker&&mission&&!previewHost){drawTracker(mission,null);tracker.hidden=enginePhase==='idle';if(sidebar)sidebar.hidden=tracker.hidden}
  if(previewHost)showPracticeMission();
  const active=month===today.slice(0,7);
  const todayRow=payload.days.find(x=>x.date===today);
  const selectedCompleted=selectedRow?.status==='finished';
  const resumable=selectedRow?.status==='started'&&selectedRow.version!==1;
  const available=!!payload.account&&payload.historyAvailable!==false&&
   enginePhase==='idle'&&(resumable||selectedDate===today&&!todayRow);
  login.hidden=!!payload.account;guestExplanation.hidden=true;
  start.hidden=!available;start.disabled=!available;
  start.textContent=resumable?'↻ Continuar missão até vencer':'▶ Receber missão de hoje';
  done.hidden=!payload.account||!selectedCompleted;
  prev.disabled=false;next.disabled=month>=today.slice(0,7);
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
  }else if(selectedCompleted||enginePhase==='finished'&&selectedDate===today){
   const result=typeof selectedRow?.score==='number'?' Você marcou '+selectedRow.score.toLocaleString('pt-BR')+' pontos.':'';
   setState('finished','🏆 Missão concluída',result+' Meta atingida. Esta missão permanece registrada no seu histórico.');
   info.textContent='Objetivo cumprido! Escolha outra missão disponível no calendário.';
  }else if(resumable){
   setState('available','Missão recebida · disponível até vencer','Você pode tentar novamente, mesmo depois da data original. Só a vitória encerra esta missão.');
   info.textContent=mission?.description||'Clique para continuar a missão.';
  }else if(currentMonth){
   setState('available','Missão de hoje disponível','Ao receber a missão, ela ficará disponível até você completar o objetivo, mesmo nos próximos dias.');
   info.textContent=mission?.description||'Escolha a missão de hoje.';
  }else{
   setState('past','Missões anteriores','Selecione um dia marcado JOGAR para retomar uma missão recebida e ainda não concluída.');
   info.textContent='Missões antigas não recebidas não podem ser iniciadas retroativamente.';
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
   if(response.status===401){setState('guest','Entre para participar','A conta gratuita habilita os desafios e seu histórico.');days.replaceChildren();monthLabel.textContent='Desafio Diário';info.textContent='Entre na sua conta para jogar. Missões recebidas ficam disponíveis até serem concluídas.';login.hidden=false;guestExplanation.hidden=false;start.hidden=true;done.hidden=true;return}
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
  if(!current?.account||!selectedDate||current.historyAvailable===false)return;
  const row=current.days.find(x=>x.date===selectedDate);
  if(selectedDate!==today&&row?.status!=='started')return;
  start.disabled=true;
  // O motor executa o POST atômico. O calendário só solicita iniciar.
  document.dispatchEvent(new CustomEvent('oldarcade:daily-start-request',{detail:{game,date:selectedDate}}));
 });
 document.addEventListener('oldarcade:daily-progress',event=>{
  const progress=(event as CustomEvent<DailyProgress>).detail;
  const mission=practiceRunning?practiceMission:current?.mission;
  if(progress?.game!==game||!mission||!tracker)return;
  drawTracker(mission,progress);tracker.hidden=false;if(sidebar)sidebar.hidden=false;
 });
 document.addEventListener('oldarcade:daily-phase',event=>{
  const detail=(event as CustomEvent<{game:string;phase:'idle'|'playing'|'pending'|'finished'}>).detail;
  if(detail?.game!==game)return;
  enginePhase=detail.phase;
  const indicator=document.querySelector<HTMLElement>('[data-daily-play-indicator]');
  if(indicator)indicator.hidden=enginePhase!=='playing';
  if(tracker){tracker.hidden=enginePhase==='idle'&&!previewHost;if(sidebar?.hasAttribute('data-daily-mission-inline'))sidebar.hidden=tracker.hidden}
  if(previewHost&&practiceRunning&&enginePhase==='finished'){
   practiceRunning=false;nextLab.disabled=false;startLab.disabled=false;
   startLab.textContent='↻ Tentar novamente';
  }
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
