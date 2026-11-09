const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const env={ROMAVA_TEAM_PASSWORD_HASH:'a'.repeat(64)};
function load(path,imports={}){const exports={};vm.runInNewContext(ts.transpile(fs.readFileSync(path,'utf8'),{module:ts.ModuleKind.CommonJS}),{exports,require:name=>imports[name]||(name.startsWith(".")?load(require("node:path").resolve(require("node:path").dirname(path),name)+".ts"):require(name)),process:{env},Buffer,Response,Request,Date,URL,Intl});return exports;}
const booking=load('lib/meeting-booking.ts');
const auth=load('lib/report-auth.ts'),report={token:'b'.repeat(48),passwordHash:'c'.repeat(64),data:{name:'تست'}};env.ROMAVA_REPORTS_CONFIG=JSON.stringify({[auth.hash(report.token)]:report});
const records=new Map(),realStore=load('lib/meeting-store.ts',{'@/lib/report-auth':auth,'@/lib/meeting-booking':booking,mongoose:{}});
const store={...realStore,currentCycle:()=> '2026-11',clientMeetings:async token=>Array.from(records.entries()).filter(([key])=>key.startsWith(token)).map(([,row])=>row),saveMeeting:async(token,name,sessionId,answers,context)=>{const key=token+sessionId;if(records.has(key))return null;const row={...answers,...context,sessionId,updatedAt:new Date()};records.set(key,row);return row;}};
const route=load('app/r/meeting/data/route.ts',{'@/lib/report-auth':auth,'@/lib/meeting-store':store,'@/lib/meeting-booking':booking});
const cookie=auth.createSession(new Request('https://example.com/r/test'),report).split(';')[0];
const input={reportMonth:1,sessionId:'12345678-1234-4234-8234-123456789abc',notes:Object.fromEntries(realStore.meetingKeys.map(k=>[k,''])),ready:Object.fromEntries(realStore.meetingKeys.map(k=>[k,false]))};input.notes.liked='متن تست';input.booking={plan:'seed',shootDate:booking.addDays(booking.tehranToday(),3),shootSlot:'morning',paymentModel:'split',firstPaymentDate:booking.tehranToday(),secondPaymentDate:booking.addDays(booking.tehranToday(),10)};
const request=(payload,extra={})=>new Request('https://example.com/r/meeting/data',{method:'PUT',headers:{cookie,origin:'https://example.com','content-type':'application/json','x-csrf-token':auth.meetingCsrf(new Request('https://example.com/r/meeting/data',{headers:{cookie}})),...extra},body:JSON.stringify(payload)});
(async()=>{assert.equal((await route.GET(new Request('https://example.com/r/meeting/data'))).status,401);assert.equal((await route.PUT(request(input,{'x-csrf-token':'wrong'}))).status,403);assert.equal((await route.PUT(request({...input,notes:{liked:'x'}}))).status,400);assert.equal((await route.PUT(request(input))).status,200);assert.equal((await route.PUT(request({...input,notes:{...input.notes,liked:'overwrite attempt'}}))).status,409);assert.equal((await route.PUT(request({...input,sessionId:'22345678-1234-4234-8234-123456789abc'}))).status,200);assert.equal((await route.PUT(request({...input,sessionId:'32345678-1234-4234-8234-123456789abc',booking:{...input.booking,shootDate:booking.tehranToday()}}))).status,400);assert.equal((await route.PUT(request({...input,booking:undefined}))).status,400);
assert.equal((await route.PUT(request({...input,reportMonth:2}))).status,422);
const response=await route.GET(new Request('https://example.com/r/meeting/data',{headers:{cookie}}));const saved=(await response.json()).sessions[0];assert.equal(saved.notes.liked,'متن تست');assert.equal(saved.booking.secondPaymentDate,booking.addDays(booking.tehranToday(),10));assert.equal(saved.reportMonth,1);assert.equal(saved.renewalMonth,2);const team=load('lib/team-auth.ts',{'@/lib/report-auth':auth});assert(!team.teamAuthenticated(new Request('https://example.com/team/meetings',{headers:{cookie}})));const teamCookie=team.teamCookie(new Request('https://example.com/team/meetings')).split(';')[0];assert(team.teamAuthenticated(new Request('https://example.com/team/meetings',{headers:{cookie:teamCookie}})));assert(!team.teamAuthenticated(new Request('https://example.com/team/meetings',{headers:{cookie:teamCookie+'x'}})));env.ROMAVA_TEAM_PASSWORD_HASH=auth.hash('team-test-password');
const teamRoute=load('app/team/meetings/route.ts',{'@/lib/report-auth':auth,'@/lib/team-auth':team,'@/lib/meeting-store':{listMeetings:async()=>[]},'@/lib/meeting-booking':booking});
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

assert.equal(booking.tehranToday(new Date('2026-11-08T21:00:00Z')),'2026-11-09');
const valid={plan:'bamboo',shootDate:'2026-11-11',shootSlot:'afternoon',paymentModel:'split',firstPaymentDate:'2026-11-08',secondPaymentDate:'2026-11-22'};
assert.equal(booking.validateBooking(valid,'2026-11-08').secondPaymentDate,'2026-11-22');
for(const patch of [{shootDate:'2026-11-10'},{shootDate:'2026-11-16'},{firstPaymentDate:'2026-11-07'},{firstPaymentDate:'2026-11-10'},{firstPaymentDate:'2026-11-11'},{shootDate:'2026-02-30'},{plan:'other'},{shootSlot:'night'},{paymentModel:'credit'}])assert.equal(booking.validateBooking({...valid,...patch},'2026-11-08'),null);
assert.equal(booking.validateBooking({...valid,paymentModel:'full'},'2026-11-08').secondPaymentDate,null);
assert.equal(booking.addDays('2026-12-25',14),'2027-01-08');assert.equal(booking.reportMeetingMonth({months:{'1':{},'2':{}}}),2);

const template=load('lib/meeting-template.ts',{'@/lib/meeting-booking':booking});
const html=template.meetingTemplate('a'.repeat(48),'synthetic','2026-11','csrf',2);new vm.Script(html.match(/<script>([\s\S]*)<\/script>/)[1]);assert(html.includes('بررسی ماه دوم و تمدید ماه سوم'));assert(html.includes('data-panel="7"'));assert(html.includes('phase-booking'));

assert(booking.validateBooking({...valid,shootDate:'2026-11-15'},'2026-11-08'));

for(const secondPaymentDate of [null,'2026-11-08','2026-11-07','2026-11-23'])assert.equal(booking.validateBooking({...valid,secondPaymentDate},'2026-11-08'),null);assert.equal(booking.validateBooking({...valid,secondPaymentDate:'2026-11-09'},'2026-11-08').secondPaymentDate,'2026-11-09');

assert.equal(booking.validateBooking({...valid,totalPrice:1,firstPaymentAmount:1},'2026-11-08').totalPrice,87000000);assert.equal(booking.validateBooking(valid,'2026-11-08').firstPaymentAmount,43500000);assert.equal(booking.validateBooking({...valid,paymentModel:'full'},'2026-11-08').firstPaymentAmount,87000000);assert.equal(booking.validateBooking({...valid,paymentModel:'full'},'2026-11-08').secondPaymentAmount,null);

assert(booking.validateBooking({...valid,firstPaymentDate:'2026-11-09'},'2026-11-08'));
