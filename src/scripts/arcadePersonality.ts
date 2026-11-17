/** Mensagens temáticas reutilizáveis, sem acoplar a jogabilidade à apresentação. */
export type PersonalityKind='danger'|'rescue';
const messages:Record<string,Record<PersonalityKind,string[]>>={
 snake:{
  danger:['Essa cobra tá precisando de uma dieta!','Olha o tamanho dessa cobra!','Tá apertando, campeão?'],
  rescue:['Tá apertando, campeão? Sacrifica uns pontinhos aí!','30 pontinhos ou a vida? Escolhe!','Coragem, campeão! Ainda dá pra escapar!']
 },
 'snake-adventure':{
  danger:['A aventura ficou perigosa!','Hora de mostrar habilidade!'],
  rescue:['Uma chance de escapar!','Vale a pena sacrificar pontos?']
 }
};
const previous=new Map<string,number>();
export function arcadePhrase(game:string,kind:PersonalityKind):string{
 const options=messages[game]?.[kind]??[];
 if(!options.length)return '';
 const key=game+':'+kind;
 const last=previous.get(key)??-1;
 const index=options.length===1?0:(last+1+Math.floor(Math.random()*(options.length-1)))%options.length;
 previous.set(key,index);
 return options[index];
}
export function arcadePersonality(game:string,kind:PersonalityKind):void{
 const message=arcadePhrase(game,kind);
 if(message)document.dispatchEvent(new CustomEvent('oldarcade:celebrate',{detail:{game,kind,message}}));
}
