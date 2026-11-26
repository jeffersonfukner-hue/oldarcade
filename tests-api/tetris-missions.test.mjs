import test from 'node:test';
import assert from 'node:assert/strict';
import {campaign,extras,missionUnlocked,newMissionState,advanceMission} from '../src/data/tetrisMissions.js';
const lock=(m,s,count,elapsed=10)=>advanceMission(m,s,{type:'lock',count,elapsed});
test('campanha sequencial e extras livres',()=>{assert.equal(missionUnlocked('c1',[]),true);assert.equal(missionUnlocked('c2',[]),false);assert.equal(missionUnlocked('c2',['c1']),true);assert.equal(missionUnlocked('c3',['c2']),false);assert.ok(extras.every(m=>missionUnlocked(m.id,[])));});
test('40 linhas, limite e estado terminal',()=>{let s=newMissionState();for(let i=0;i<10;i++)s=lock(campaign[0],s,4);assert.equal(s.status,'won');assert.equal(s.progress,40);assert.equal(lock(campaign[0],newMissionState(),4,300000).status,'lost');assert.equal(lock(campaign[0],s,4),s);});
test('precisão estrita, combo e resistência',()=>{assert.equal(lock(campaign[7],newMissionState(),2).status,'lost');let s=lock(campaign[3],newMissionState(),1);assert.equal(lock(campaign[3],s,0).progress,0);assert.equal(lock(extras[3],newMissionState(),2).status,'finished');assert.equal(advanceMission(campaign[4],newMissionState(),{type:'tick',elapsed:420000}).status,'won');});
