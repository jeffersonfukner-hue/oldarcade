/**
 * Contrato compartilhado de repetição do Desafio Diário.
 * Derrota não inicia jogo livre: a mesma data/missão é retomada via fluxo
 * oficial (novo token do servidor), ou via laboratório sem banco.
 * Resultado pendente deve ser reenviado pelo motor antes de oferecer replay.
 */
export type DailyReplayAttempt={
 date:string;seed:number;token:string;mission?:unknown;practice?:boolean
};
export const DAILY_RETRY_LABEL='↻ Tentar desafio novamente';
export const DAILY_RETRY_QUESTION='Quer começar novamente este desafio?';

export function setupDailyMissionReplay(game:'snake'|'tetris'){
 let replay:DailyReplayAttempt|null=null;
 return {
  clear(){replay=null},
  offer(attempt:DailyReplayAttempt,won:boolean){
   replay=won?null:attempt;
   return won?null:{label:DAILY_RETRY_LABEL,question:DAILY_RETRY_QUESTION};
  },
  hasRetry(){return replay!==null},
  retry(){
   if(!replay)return false;
   const attempt=replay;
   if(attempt.practice){
    document.dispatchEvent(new CustomEvent('oldarcade:daily-practice-start',{
     detail:{game,date:attempt.date,seed:attempt.seed,mission:attempt.mission}
    }));
   }else{
    document.dispatchEvent(new CustomEvent('oldarcade:daily-start-request',{
     detail:{game,date:attempt.date}
    }));
   }
   return true;
  }
 };
}
