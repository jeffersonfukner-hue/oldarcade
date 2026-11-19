import type {InputFrame} from './physics';
export function setupPlatformInput(root:HTMLElement){
 const keyboard=new Set<string>(),touch=new Set<string>();
 const aliases:Record<string,string>={arrowleft:'left',a:'left',arrowright:'right',d:'right',arrowup:'jump',w:'jump',' ':'jump'};
 const onKeyDown=(event:KeyboardEvent)=>{const key=aliases[event.key.toLowerCase()];if(key&&!event.ctrlKey&&!event.altKey&&!event.metaKey){event.preventDefault();keyboard.add(key)}};
 const onKeyUp=(event:KeyboardEvent)=>{const key=aliases[event.key.toLowerCase()];if(key){event.preventDefault();keyboard.delete(key)}};
 const reset=()=>{keyboard.clear();touch.clear()};
 window.addEventListener('keydown',onKeyDown);
 window.addEventListener('keyup',onKeyUp);
 window.addEventListener('blur',reset);
 const controls=root.querySelectorAll<HTMLButtonElement>('[data-pq-control]');
 const release=(event:PointerEvent)=>{const button=event.currentTarget as HTMLButtonElement;touch.delete(button.dataset.pqControl||'');if(button.hasPointerCapture(event.pointerId))button.releasePointerCapture(event.pointerId)};
 controls.forEach(button=>{
  button.addEventListener('pointerdown',event=>{event.preventDefault();touch.add(button.dataset.pqControl||'');button.setPointerCapture(event.pointerId)});
  button.addEventListener('pointerup',release);
  button.addEventListener('pointercancel',release);
  button.addEventListener('lostpointercapture',()=>touch.delete(button.dataset.pqControl||''));
 });
 return {read():InputFrame{return {left:keyboard.has('left')||touch.has('left'),right:keyboard.has('right')||touch.has('right'),jump:keyboard.has('jump')||touch.has('jump')}},
 reset,dispose(){reset();window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);window.removeEventListener('blur',reset)}};
}
