const encoder=new TextEncoder();
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const rounds=210000;
export function normalizeNickname(value){
 if(typeof value!=='string')return null;
 const nickname=value.trim().normalize('NFKC');
 if(nickname.length<3||nickname.length>18||!(/^[\p{L}\p{N}_.-]+$/u).test(nickname))return null;
 return {nickname,key:nickname.toLocaleLowerCase('und')};
}
export function normalizeEmail(value){
 if(value===undefined||value===null||value==='')return null;
 if(typeof value!=='string')return false;
 const email=value.trim().toLowerCase();
 return email.length<=254&&/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)?email:false;
}
export function validPassword(value){
 return typeof value==='string'&&value.length>=12&&value.length<=128&&encoder.encode(value).length<=256;
}
function hex(bytes){return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')}
export function randomToken(n=32){return hex(crypto.getRandomValues(new Uint8Array(n)))}
export async function digest(value){return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))))}
export async function passwordHash(password,salt){
 const base=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations:rounds},base,256);
 return hex(new Uint8Array(bits));
}
export function equalFixed(a,b){
 if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;
 let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
 return diff===0;
}
export function reply(data,status=200,headers={}){
 return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
}
export function cookieHeader(token){
 return 'oldarcade_session='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000';
}
export function clearCookie(){
 return 'oldarcade_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}
export function sessionCookie(request){
 const found=request.headers.get('Cookie')?.match(/(?:^|;\s*)oldarcade_session=([0-9a-f]{64})(?:;|$)/);
 return found?.[1]||null;
}
export async function currentPlayer(db,request){
 const token=sessionCookie(request);if(!token)return null;
 const hash=await digest(token),now=Math.floor(Date.now()/1000);
 return db.prepare('SELECT a.id,a.nickname,a.email,a.email_verified FROM player_sessions s JOIN player_accounts a ON a.id=s.player_id WHERE s.token_hash=? AND s.expires_at>?')
 .bind(hash,now).first();
}
export function sameOrigin(request){
 return request.headers.get('Origin')===new URL(request.url).origin;
}
export async function parseBody(request){
 if(request.headers.get('Content-Type')?.split(';')[0].trim()!=='application/json')return null;
 const raw=await request.text();if(raw.length>2048)return null;
 try{return JSON.parse(raw)}catch{return null}
}
export function playerResponse(player){return {id:player.id,nickname:player.nickname,email:player.email||null,emailVerified:Boolean(player.email_verified)}}
