/** Campanha e extras independentes do Desafio Diário e do ranking Sprint legado. */
export const campaign=Object.freeze([
 {id:'c1',title:'Corrida das 40',kind:'lines',target:40,limit:300000,description:'Elimine 40 linhas em 5 minutos.'},
 {id:'c2',title:'Mestre do Tetris',kind:'exact',count:4,target:5,limit:420000,description:'Faça 5 eliminações quádruplas em 7 minutos.'},
 {id:'c3',title:'Precisão dupla',kind:'exact',count:2,target:8,limit:300000,description:'Faça 8 eliminações duplas em 5 minutos.'},
 {id:'c4',title:'Combo implacável',kind:'combo',target:5,limit:420000,description:'Elimine linhas com 5 peças consecutivas.'},
 {id:'c5',title:'Sobrevivente',kind:'survive',target:420000,limit:0,description:'Resista durante 7 minutos com velocidade crescente.'},
 {id:'c6',title:'Caçador de triplas',kind:'exact',count:3,target:6,limit:420000,description:'Faça 6 eliminações triplas.'},
 {id:'c7',title:'Maratona 100',kind:'lines',target:100,limit:720000,description:'Elimine 100 linhas em 12 minutos.'},
 {id:'c8',title:'Quatro ou nada',kind:'strict',count:4,target:4,limit:420000,description:'Faça 4 eliminações quádruplas sem limpar outras quantidades.'}
].map(Object.freeze));
export const extras=Object.freeze([1,2,3,4].map(count=>Object.freeze({id:'e'+count,title:'Resistência '+count+'L',kind:'endurance',count,target:0,limit:0,description:'Resista o máximo possível eliminando somente '+count+' linha(s) de cada vez.'})));
export const missions=Object.freeze([...campaign,...extras]);
export function missionUnlocked(id,completed){
 const index=campaign.findIndex(m=>m.id===id);
 return extras.some(m=>m.id===id)||index>=0&&campaign.slice(0,index).every(m=>completed.includes(m.id));
}
export function newMissionState(){return {status:'playing',progress:0,streak:0,elapsed:0};}
export function advanceMission(m,state,event){
 if(state.status!=='playing')return state;
 const elapsed=Math.max(state.elapsed,event.elapsed);
 const next={...state,elapsed};
 if(m.limit&&elapsed>=m.limit)return {...next,status:'lost'};
 if(event.type==='end')return {...next,status:m.kind==='endurance'?'finished':'lost'};
 if(m.kind==='survive'){next.progress=elapsed;}
 if(m.kind==='endurance'){next.progress=elapsed;}
 if(event.type==='lock'){
  const n=event.count||0;
  if(m.kind==='lines')next.progress+=n;
  if(m.kind==='exact'&&n===m.count)next.progress++;
  if(m.kind==='combo'){next.streak=n?next.streak+1:0;next.progress=next.streak;}
  if(m.kind==='strict'&&n){if(n!==m.count)return {...next,status:'lost'};next.progress++;}
  if(m.kind==='endurance'&&n&&n!==m.count)return {...next,status:'finished'};
 }
 if(m.kind!=='endurance'&&next.progress>=m.target)next.status='won';
 return next;
}
