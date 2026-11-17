import {DAILY_MODES} from '../data/dailyChallenges.js';
type DayStatus={date:string;status:'started'|'finished'};
type CalendarResponse={game:string;today:string;month:string;days:DayStatus[];account:{nickname:string}};
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
 let today='',month='',current:CalendarResponse|null=null,sequence=0;
 const render=(payload:CalendarResponse)=>{
  const statuses=new Map(payload.days.map(row=>[row.date,row.status]));
  const {offset,days:count}=monthDays(payload.month);
  const cells:HTMLElement[]=[];
  for(let i=0;i<offset;i++){const space=document.createElement('span');space.className='daily-day-spacer';space.setAttribute('aria-hidden','true');cells.push(space)}
  for(let i=1;i<=count;i++){
   const date=payload.month+'-'+String(i).padStart(2,'0');
   const participated=statuses.get(date);
   const status=participated|| (date===payload.today?'today':date<payload.today?'past':'future');
   const button=document.createElement('button');button.type='button';button.disabled=true;
   button.className='daily-day';button.dataset.status=status;button.setAttribute('aria-label',date+' · '+(participated==='finished'?'concluído':participated==='started'?'tentativa utilizada':date===payload.today?'disponível hoje':date<payload.today?'encerrado':'ainda não disponível'));
   button.textContent=String(i);
   const detail=document.createElement('span');detail.className='daily-mark';
   detail.textContent=participated==='finished'?'✓':participated==='started'?'•':date===payload.today?'HOJE':'';
   button.append(detail);cells.push(button);
  }
  days.replaceChildren(...cells);
  today=payload.today;month=payload.month;current=payload;
  monthLabel.textContent=monthName(month);
  const active=month===today.slice(0,7);
  const attempted=payload.days.some(x=>x.date===today);
  login.hidden=true;start.hidden=!active||attempted;start.disabled=!active||attempted;
  done.hidden=!attempted;next.disabled=month>=today.slice(0,7);
  info.textContent=attempted?'Sua tentativa de hoje já foi utilizada. O próximo desafio abre amanhã.':active?'Desafio disponível para sua conta: uma única tentativa hoje.':'Somente os desafios do dia atual podem ser iniciados.';
 };
 const load=async(wanted?:string)=>{
  const seq=++sequence;
  info.textContent='Consultando o calendário e sua participação…';
  try{
   const url='/api/daily/'+encodeURIComponent(game)+(wanted?'?month='+encodeURIComponent(wanted):'');
   const response=await fetch(url,{cache:'no-store'});
   if(seq!==sequence)return;
   if(response.status===401){days.replaceChildren();monthLabel.textContent='Desafio Diário';info.textContent='Entre na sua conta para jogar. Cada desafio permite somente uma tentativa por dia.';login.hidden=false;start.hidden=true;done.hidden=true;return}
   const payload=await response.json() as CalendarResponse&{error?:string};
   if(!response.ok)throw Error(payload.error||'Não foi possível consultar os desafios.');
   render(payload);
  }catch(error){
   if(seq!==sequence)return;
   info.textContent=error instanceof Error?error.message:'Não foi possível carregar o calendário.';
   start.hidden=true;done.hidden=true;login.hidden=true;
  }
 };
 prev.addEventListener('click',()=>void load(moveMonth(month||today.slice(0,7),-1)));
 next.addEventListener('click',()=>{if(current&&moveMonth(month,1)<=today.slice(0,7))void load(moveMonth(month,1))});
 start.addEventListener('click',()=>{
  if(!current||current.today!==today||current.month!==today.slice(0,7))return;
  start.disabled=true;
  // O motor executa o POST atômico. O calendário só solicita iniciar.
  document.dispatchEvent(new CustomEvent('oldarcade:daily-start-request',{detail:{game,date:today}}));
 });
 document.addEventListener('oldarcade:daily-status-changed',event=>{
  const data=(event as CustomEvent<{game:string}>).detail;
  if(data?.game===game)void load(month||undefined);
 });
 document.addEventListener('oldarcade:account-changed',()=>void load(month||undefined));
 window.addEventListener('pageshow',event=>{if(event.persisted)void load(month||undefined)});
 void load();
}
