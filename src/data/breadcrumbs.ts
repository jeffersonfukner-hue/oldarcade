/** Breadcrumbs do portal: rotas reais do menu e do catálogo de modalidades. */
import {gameModes} from './gameModes.js';

export interface BreadcrumbItem {
 label:string;
 href:string;
}

/** O link de Jogos aponta para a seção existente na home (não inventar /jogos/). */
const indexLinks:Record<string,string>={
 '/rankings/':'Rankings',
 '/conta/':'Minha conta',
 '/sobre/':'Sobre',
 '/contato/':'Contato',
 '/privacidade/':'Privacidade',
};
const home:BreadcrumbItem={label:'Início',href:'/'};
const games:BreadcrumbItem={label:'Jogos',href:'/#destaques'};

export function breadcrumbsForPath(path:string):BreadcrumbItem[]{
 const clean='/' + path.split(/[?#]/)[0].split('/').filter(Boolean).join('/');
 const pathname=clean==='/'?'/':clean+'/';
 if(pathname==='/')return [];
 const staticLabel=indexLinks[pathname];
 if(staticLabel)return [home,{label:staticLabel,href:pathname}];

 const mode=Object.values(gameModes).find(value=>value.url===pathname);
 if(!mode)return [];
 const root=Object.values(gameModes).find(value=>value.title===mode.title&&value.url===`/jogos/${mode.title}/`);
 if(!root)return [home,games,{label:mode.name,href:pathname}];
 const rootLabel=root.name.endsWith(' Clássico')?root.name.slice(0,-' Clássico'.length):root.name;
 const trail=[home,games,{label:rootLabel,href:root.url}];
 if(mode.url!==root.url){
  const detail=mode.name.startsWith(rootLabel+' ')?mode.name.slice(rootLabel.length+1):mode.name;
  trail.push({label:detail,href:mode.url});
 }
 return trail;
}
