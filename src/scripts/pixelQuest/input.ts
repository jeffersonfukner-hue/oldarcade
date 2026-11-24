import type {InputFrame} from './physics';
export function setupPlatformInput(root:HTMLElement){
 const keyboard=new Set<string>(),touchByPointer=new Map<number,string>();
 const aliases:Record<string,string>={arrowleft:'left',a:'left',arrowright:'right',d:'right',arrowup:'jump',w:'jump',' ':'jump'};
 const onKeyDown=(event:KeyboardEvent)=>{if((event.target as HTMLElement|null)?.matches('input,textarea,select,[contenteditable]'))return;const key=aliases[event.key.toLowerCase()];if(key&&!event.ctrlKey&&!event.altKey&&!event.metaKey){event.preventDefault();keyboard.add(key)}};
 const onKeyUp=(event:KeyboardEvent)=>{const key=aliases[event.key.toLowerCase()];if(key){event.preventDefault();keyboard.delete(key)}};
 const reset=()=>{keyboard.clear();touchByPointer.clear()};
 window.addEventListener('keydown',onKeyDown);
 window.addEventListener('keyup',onKeyUp);
 window.addEventListener('blur',reset);
 const controls=root.querySelectorAll<HTMLButtonElement>('[data-pq-control]');
 const release=(event:PointerEvent)=>{
  touchByPointer.delete(event.pointerId);
  const button=event.currentTarget as HTMLButtonElement;
  if(button instanceof HTMLButtonElement&&button.hasPointerCapture(event.pointerId))button.releasePointerCapture(event.pointerId);
 };
 controls.forEach(button=>{
  button.addEventListener('pointerdown',event=>{event.preventDefault();touchByPointer.set(event.pointerId,button.dataset.pqControl||'');button.setPointerCapture(event.pointerId)});
  button.addEventListener('pointerup',release);
  button.addEventListener('pointercancel',release);
  button.addEventListener('lostpointercapture',event=>touchByPointer.delete(event.pointerId));
  button.addEventListener('contextmenu',event=>event.preventDefault());
 });
 // iPadOS pode entregar o término do toque fora do botão; a captura global
 // garante que soltar o dedo interrompa a ação, mesmo nesse caso.
 window.addEventListener('pointerup',release,true);
 window.addEventListener('pointercancel',release,true);
 const touching=(control:string)=>Array.from(touchByPointer.values()).includes(control);
 return {read():InputFrame{return {left:keyboard.has('left')||touching('left'),right:keyboard.has('right')||touching('right'),jump:keyboard.has('jump')||touching('jump')}},
 reset,dispose(){reset();window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);window.removeEventListener('blur',reset);window.removeEventListener('pointerup',release,true);window.removeEventListener('pointercancel',release,true)}};
}
