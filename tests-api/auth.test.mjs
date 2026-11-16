import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeNickname,normalizeEmail,validPassword,passwordHash,randomToken,digest,equalFixed,cookieHeader,sessionCookie} from '../functions/api/_lib/auth.js';

test('nickname único é normalizado e valida caracteres',()=>{
 assert.deepEqual(normalizeNickname('  Vovo3D '),{nickname:'Vovo3D',key:'vovo3d'});
 assert.equal(normalizeNickname(''),null);
 assert.deepEqual(normalizeNickname('Vovo do 3D'),{nickname:'Vovo do 3D',key:'vovo do 3d'});
 assert.deepEqual(normalizeNickname('  Vovo  do   3D '),{nickname:'Vovo do 3D',key:'vovo do 3d'});
 assert.equal(normalizeNickname('<script>'),null);
 assert.equal(normalizeNickname('Jogador muito muito grande'),null);
});
test('e-mail é opcional e senha exige comprimento mínimo',()=>{
 assert.equal(normalizeEmail(''),null);
 assert.equal(normalizeEmail('  Teste@Example.com '),'teste@example.com');
 assert.equal(normalizeEmail('texto-sem-email'),false);
 assert.equal(validPassword('abc'),false);
 assert.equal(validPassword('1234567'),false);
 assert.equal(validPassword('12345678'),true);
 assert.equal(validPassword('senha-muito-longa'),true);
});
test('hash de senha usa salt, não armazena senha em claro e é verificável',async()=>{
 const a=randomToken(16),b=randomToken(16);
 const h=await passwordHash('senha forte de teste',a);
 assert.equal(h.length,64);
 assert.notEqual(h,'senha forte de teste');
 assert.equal(equalFixed(h,await passwordHash('senha forte de teste',a)),true);
 assert.equal(equalFixed(h,await passwordHash('senha forte de teste',b)),false);
 const recovery=await digest(randomToken(20));
 assert.equal(recovery.length,64);
});
test('sessão usa cookie inacessível ao JavaScript e restrito ao site',()=>{
 const token=randomToken();
 const header=cookieHeader(token);
 assert.match(header,/HttpOnly/);
 assert.match(header,/Secure/);
 assert.match(header,/SameSite=Strict/);
 assert.equal(sessionCookie({headers:new Headers({Cookie:'oldarcade_session='+token})}),token);
 assert.equal(sessionCookie({headers:new Headers({Cookie:'outro=1'})}),null);
});
