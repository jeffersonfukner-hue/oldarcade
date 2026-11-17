/** Cronômetro de tempo efetivo: ignora pausa e contagem regressiva. */
export function setupGameClock(screen:HTMLElement,active:()=>boolean){
 const label=document.createElement('span');
 label.dataset.gameClock='true';label.setAttribute('aria-label','Tempo jogado');
 label.style.cssText='display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border:1px solid #58717c;border-radius:8px;background:#10242b;color:#e5f8ff;font-variant-numeric:tabular-nums;font-weight:700';
 const hud=screen.querySelector<HTMLElement>('[id*="hud"],[class*="hud"]');
 (hud??screen).prepend(label);
 let elapsed=0,last=performance.now();
 const format=(ms:number)=>{const secs=Math.floor(ms/1000);return '⏱ '+Math.floor(secs/60).toString().padStart(2,'0')+':'+(secs%60).toString().padStart(2,'0')};
 const render=()=>{const now=performance.now();if(active())elapsed+=Math.max(0,now-last);last=now;label.textContent=format(elapsed)};
 const timer=window.setInterval(render,200);
 render();
 return {reset(){elapsed=0;last=performance.now();render()},milliseconds(){render();return Math.round(elapsed)},seconds(){render();return Math.floor(elapsed/1000)},dispose(){window.clearInterval(timer)}};
}
