import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validGameScore} from '../functions/api/games/[game]/leaderboard.js';
test('Aventura aceita pontos reais de maçã, ouro, gelo e velocidade',()=>{
 for(const score of [0,10,15,20,35,50,75,350,360,375,4000])assert.equal(validGameScore('snake-adventure',score),true,'Aventura '+score);
 for(const score of [-5,1,12,376,4005,Infinity,NaN,375.5,'375'])assert.equal(validGameScore('snake-adventure',score),false,'Aventura rejeita '+score);
});
test('Clássico continua exigindo múltiplos de dez',()=>{
 for(const score of [0,10,30,350,360,4000])assert.equal(validGameScore('snake',score),true);
 for(const score of [-10,5,15,375,4001,Infinity,NaN])assert.equal(validGameScore('snake',score),false);
 assert.equal(validGameScore('pong',100),false);
});
