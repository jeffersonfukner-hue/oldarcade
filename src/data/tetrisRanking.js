import {campaign,extras} from './tetrisMissions.js';
export const TETRIS_RANK_VERSION=2;
export const tetrisScopes=Object.freeze(['classic','sprint','survival',...campaign.map(m=>m.id),...extras.map(m=>m.id)]);
export function tetrisRankOrder(scope){
 if(!tetrisScopes.includes(scope))return null;
 if(scope==='survival'||extras.some(m=>m.id===scope))return ['duration_ms DESC','points DESC'];
 if(scope==='sprint'||scope==='c1'||scope==='c7')return ['duration_ms ASC','points DESC'];
 return ['points DESC','duration_ms ASC'];
}
export function validTetrisResult(scope,data){
 if(!tetrisRankOrder(scope)||!data||!Number.isSafeInteger(data.points)||data.points<0||data.points>100000000||!Number.isSafeInteger(data.durationMs)||data.durationMs<1||data.durationMs>86400000||!Array.isArray(data.counts)||data.counts.length!==4||data.counts.some(n=>!Number.isSafeInteger(n)||n<0||n>1000000))return false;
 const lines=data.counts.reduce((sum,n,i)=>sum+n*(i+1),0);
 if(data.points!==data.counts.reduce((sum,n,i)=>sum+n*[100,200,400,800][i],0))return false;
 if(scope==='sprint'&&lines<40)return false;
 const m=campaign.find(m=>m.id===scope);
 if(m){
  if(m.limit&&data.durationMs>=m.limit)return false;
  if(m.kind==='lines'&&lines<m.target)return false;
  if((m.kind==='exact'||m.kind==='strict')&&data.counts[m.count-1]<m.target)return false;
  if(m.kind==='strict'&&data.counts.some((n,i)=>i!==m.count-1&&n>0))return false;
  if(m.kind==='survive'&&data.durationMs<m.target)return false;
  if(m.kind==='combo'&&data.counts.reduce((x,y)=>x+y,0)<m.target)return false;
 }
 return true;
}
export function completedCampaign(value){
 if(!Array.isArray(value))return [];
 const result=[];
 for(const m of campaign){if(!value.includes(m.id))break;result.push(m.id);}
 return result;
}
