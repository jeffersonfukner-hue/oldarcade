type Entry={nickname:string;points:number;durationMs:number;rank:number};
document.querySelectorAll<HTMLDetailsElement>('[data-tetris-v2-browser]').forEach(root=>{
 const select=root.querySelector<HTMLSelectElement>('[data-tetris-v2-scope]')!;
 const status=root.querySelector<HTMLElement>('[data-tetris-v2-browser-status]')!;
 const top=root.querySelector<HTMLOListElement>('[data-tetris-v2-browser-top]')!;
 const own=root.querySelector<HTMLElement>('[data-tetris-v2-browser-own]')!;
 const personal=root.dataset.personal==='true';
 let rev=0;
 const fmt=(r:{points:number;durationMs:number})=>r.points+' pts · '+(r.durationMs/1000).toFixed(3)+' s';
 async function load(){
  const version=++rev;top.replaceChildren();own.textContent='';status.textContent='Consultando…';
  try{
   const response=await fetch('/api/tetris/rankings/'+encodeURIComponent(select.value),{cache:'no-store'});
   const data=await response.json() as {available:boolean;top?:Entry[];mine?:Entry|null};
   if(version!==rev)return;
   if(!response.ok||!data.available)throw Error('unavailable');
   if(!personal)for(const row of data.top??[]){const li=document.createElement('li');li.textContent=row.rank+'º · '+row.nickname+' · '+fmt(row);top.append(li);}
   own.textContent=data.mine?'Seu recorde: '+fmt(data.mine):'Sem recorde da conta nesta modalidade.';
   status.textContent='Classificação v2 · independente dos recordes originais.';
  }catch{if(version===rev)status.textContent='Classificação indisponível neste ambiente.';}
 }
 select.addEventListener('change',()=>{if(root.open)void load();});
 root.addEventListener('toggle',()=>{if(root.open)void load();});
 document.addEventListener('oldarcade:account-changed',()=>{++rev;own.textContent='';if(root.open)void load();});
 if(location.hash==='#'+root.id)root.open=true;
 if(root.open)void load();
});
