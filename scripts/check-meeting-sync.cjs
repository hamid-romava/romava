const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const env={ROMAVA_TEAM_PASSWORD_HASH:'a'.repeat(64)};
function load(path,imports={}){const exports={};vm.runInNewContext(ts.transpile(fs.readFileSync(path,'utf8'),{module:ts.ModuleKind.CommonJS}),{exports,require:name=>imports[name]||require(name),process:{env},Buffer,Response,Request,Date,URL,Intl});return exports;}
const auth=load('lib/report-auth.ts'),report={token:'b'.repeat(48),passwordHash:'c'.repeat(64),data:{name:'تست'}};env.ROMAVA_REPORTS_CONFIG=JSON.stringify({[auth.hash(report.token)]:report});
const records=new Map(),realStore=load('lib/meeting-store.ts',{'@/lib/report-auth':auth,mongoose:{}});
const store={...realStore,currentCycle:()=> '2026-11',clientMeetings:async token=>Array.from(records.entries()).filter(([key])=>key.startsWith(token)).map(([,row])=>row),saveMeeting:async(token,name,sessionId,answers)=>{const key=token+sessionId;if(records.has(key))return null;const row={...answers,sessionId,updatedAt:new Date()};records.set(key,row);return row;}};
const route=load('app/r/meeting/data/route.ts',{'@/lib/report-auth':auth,'@/lib/meeting-store':store});
const cookie=auth.createSession(new Request('https://example.com/r/test'),report).split(';')[0];
const input={sessionId:'12345678-1234-4234-8234-123456789abc',notes:Object.fromEntries(realStore.meetingKeys.map(k=>[k,''])),ready:Object.fromEntries(realStore.meetingKeys.map(k=>[k,false]))};input.notes.liked='متن تست';
const request=(payload,extra={})=>new Request('https://example.com/r/meeting/data',{method:'PUT',headers:{cookie,origin:'https://example.com','content-type':'application/json','x-csrf-token':auth.meetingCsrf(new Request('https://example.com/r/meeting/data',{headers:{cookie}})),...extra},body:JSON.stringify(payload)});
(async()=>{assert.equal((await route.GET(new Request('https://example.com/r/meeting/data'))).status,401);assert.equal((await route.PUT(request(input,{'x-csrf-token':'wrong'}))).status,403);assert.equal((await route.PUT(request({...input,notes:{liked:'x'}}))).status,400);assert.equal((await route.PUT(request(input))).status,200);assert.equal((await route.PUT(request({...input,notes:{...input.notes,liked:'overwrite attempt'}}))).status,409);assert.equal((await route.PUT(request({...input,sessionId:'22345678-1234-4234-8234-123456789abc'}))).status,200);const response=await route.GET(new Request('https://example.com/r/meeting/data',{headers:{cookie}}));assert.equal((await response.json()).sessions[0].notes.liked,'متن تست');const team=load('lib/team-auth.ts',{'@/lib/report-auth':auth});assert(!team.teamAuthenticated(new Request('https://example.com/team/meetings',{headers:{cookie}})));const teamCookie=team.teamCookie(new Request('https://example.com/team/meetings')).split(';')[0];assert(team.teamAuthenticated(new Request('https://example.com/team/meetings',{headers:{cookie:teamCookie}})));assert(!team.teamAuthenticated(new Request('https://example.com/team/meetings',{headers:{cookie:teamCookie+'x'}})));env.ROMAVA_TEAM_PASSWORD_HASH=auth.hash('team-test-password');
const teamRoute=load('app/team/meetings/route.ts',{'@/lib/report-auth':auth,'@/lib/team-auth':team,'@/lib/meeting-store':{listMeetings:async()=>[]}});
const loginPage=await teamRoute.GET(new Request('https://example.com/team/meetings'));
const nonce=(await loginPage.text()).match(/name="csrf" value="([a-f0-9]+)"/)[1];
const loginCookie=loginPage.headers.get('set-cookie').split(';')[0];
for(const origin of [null,'null','https://chatgpt.com']){
 const headers={cookie:loginCookie,'content-type':'application/x-www-form-urlencoded'};if(origin)headers.origin=origin;
 const response=await teamRoute.POST(new Request('https://example.com/team/meetings',{method:'POST',headers,body:new URLSearchParams({username:'romava',password:'team-test-password',csrf:nonce})}));
 assert.equal(response.status,303);assert(response.headers.get('set-cookie').startsWith('romava_team_session='));
}
const forged=await teamRoute.POST(new Request('https://example.com/team/meetings',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({username:'romava',password:'team-test-password',csrf:nonce})}));
assert(!forged.headers.get('set-cookie').startsWith('romava_team_session='));
console.log('PASS meeting sync: authenticated account, origin/validation, persistent readback, conflict protection, separate team session, tampering');})().catch(e=>{console.error(e);process.exitCode=1;});
