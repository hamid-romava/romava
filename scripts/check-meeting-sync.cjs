const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const env={ROMAVA_TEAM_PASSWORD_HASH:'a'.repeat(64)};
function load(path,imports={}){const exports={};vm.runInNewContext(ts.transpile(fs.readFileSync(path,'utf8'),{module:ts.ModuleKind.CommonJS}),{exports,require:name=>imports[name]||(name.endsWith("/onboarding")?{requireOnboarding:async()=>null}:null)||(name.startsWith(".")?load(require("node:path").resolve(require("node:path").dirname(path),name)+".ts"):require(name)),process:{env},Buffer,Response,Request,Date,URL,Intl});return exports;}
const booking=load('lib/meeting-booking.ts');
const auth=load('lib/report-auth.ts'),report={token:'b'.repeat(48),passwordHash:'c'.repeat(64),data:{name:'تست'}};env.ROMAVA_REPORTS_CONFIG=JSON.stringify({[auth.hash(report.token)]:report});
const records=new Map(),realStore=load('lib/meeting-store.ts',{'@/lib/report-auth':auth,'@/lib/meeting-booking':booking,mongoose:{}});
const store={...realStore,currentCycle:()=> '2026-11',clientMeetings:async token=>Array.from(records.entries()).filter(([key])=>key.startsWith(token)).map(([,row])=>row),saveMeeting:async(token,name,sessionId,answers,context)=>{const key=token+sessionId;if(records.has(key))return null;const row={...answers,...context,sessionId,updatedAt:new Date()};records.set(key,row);return row;}};
const route=load('app/r/meeting/data/route.ts',{'@/lib/report-auth':auth,'../../../../lib/pricing-store':{getPricing:async()=>load('lib/pricing-plans.ts').defaultPricing},'@/lib/meeting-store':store,'@/lib/meeting-booking':booking});
const cookie=auth.createSession(new Request('https://example.com/r/test'),report).split(';')[0];
const input={reportMonth:1,sessionId:'12345678-1234-4234-8234-123456789abc',notes:Object.fromEntries(realStore.meetingKeys.map(k=>[k,''])),ready:Object.fromEntries(realStore.meetingKeys.map(k=>[k,false]))};input.notes.liked='متن تست';input.booking={plan:'seed',shootDate:booking.addDays(booking.tehranToday(),3),shootSlot:'morning',paymentModel:'split',firstPaymentDate:booking.tehranToday(),secondPaymentDate:booking.addDays(booking.tehranToday(),10)};
const request=(payload,extra={})=>new Request('https://example.com/r/meeting/data',{method:'PUT',headers:{cookie,origin:'https://example.com','content-type':'application/json','x-csrf-token':auth.meetingCsrf(new Request('https://example.com/r/meeting/data',{headers:{cookie}})),...extra},body:JSON.stringify(payload)});
(async()=>{assert.equal((await route.GET(new Request('https://example.com/r/meeting/data'))).status,401);assert.equal((await route.PUT(request(input,{'x-csrf-token':'wrong'}))).status,403);assert.equal((await route.PUT(request({...input,notes:{liked:'x'}}))).status,400);assert.equal((await route.PUT(request({...input,quotedTotal:1}))).status,412);assert.equal((await route.PUT(request(input))).status,200);assert.equal((await route.PUT(request({...input,notes:{...input.notes,liked:'overwrite attempt'}}))).status,409);assert.equal((await route.PUT(request({...input,sessionId:'22345678-1234-4234-8234-123456789abc'}))).status,200);assert.equal((await route.PUT(request({...input,sessionId:'32345678-1234-4234-8234-123456789abc',booking:{...input.booking,shootDate:booking.tehranToday()}}))).status,400);assert.equal((await route.PUT(request({...input,booking:undefined}))).status,400);
assert.equal((await route.PUT(request({...input,reportMonth:2}))).status,422);
const response=await route.GET(new Request('https://example.com/r/meeting/data',{headers:{cookie}}));const saved=(await response.json()).sessions[0];assert.equal(saved.notes.liked,'متن تست');assert.equal(saved.booking.secondPaymentDate,booking.addDays(booking.tehranToday(),10));assert.equal(saved.reportMonth,1);assert.equal(saved.renewalMonth,2);const team=load('lib/team-auth.ts',{'@/lib/report-auth':auth});assert(!team.teamAuthenticated(new Request('https://example.com/blackhorse',{headers:{cookie}})));const teamCookie=team.teamCookie(new Request('https://example.com/blackhorse')).split(';')[0];assert(team.teamAuthenticated(new Request('https://example.com/blackhorse',{headers:{cookie:teamCookie}})));assert(!team.teamAuthenticated(new Request('https://example.com/blackhorse',{headers:{cookie:teamCookie+'x'}})));env.ROMAVA_TEAM_PASSWORD_HASH=auth.hash('team-test-password');
const teamRoute=load('app/blackhorse/route.ts',{'@/lib/report-auth':auth,'@/lib/team-auth':team,'@/lib/meeting-store':{listMeetings:async()=>[]},'@/lib/meeting-booking':booking});
const requestsUrl = 'https://example.com/blackhorse?view=requests';
let contactReads = 0;
const cursor = {
  sort() { return this; }, skip() { return this; }, limit() { return this; },
  async toArray() { contactReads++; return [{ name: 'درخواست نمونه', message: '<script>example</script>', phone: '09120000000' }]; },
};
const requestsRoute = load('app/blackhorse/route.ts', {
  '@/lib/report-auth': auth, '@/lib/team-auth': team, '@/lib/meeting-booking': booking,
  '@/lib/meeting-store': { listMeetings: async () => [] },
  '@/lib/mongodb': { default: Promise.resolve({ db: name => {
    assert.equal(name, 'mydb');
    return { collection: name => {
      if (name === 'client_feedback') return { find: () => ({
        ...cursor,
        async toArray() { return [{ clientName: 'مشتری نمونه', kind: 'idea', message: '<b>پیام نمونه</b>' }]; },
      }) };
      assert.equal(name, 'contacts');
      return { find: () => cursor };
    }};
  }}) },
});
const denied = await requestsRoute.GET(new Request(requestsUrl));
assert(!(await denied.text()).includes('درخواست نمونه'));
assert.equal(contactReads, 0);
const authorizedCookie = team.teamCookie(new Request(requestsUrl)).split(';')[0];
const requests = await requestsRoute.GET(new Request(requestsUrl, { headers: { cookie: authorizedCookie } }));
assert.equal(requests.status, 200);
assert.match(requests.headers.get('cache-control'), /no-store/);
const requestsHtml = await requests.text();
assert(requestsHtml.includes('درخواست نمونه'));
assert(requestsHtml.includes('&lt;script&gt;example&lt;/script&gt;'));
assert.equal(contactReads, 1);
const feedbackUrl = requestsUrl.replace('view=requests', 'view=feedback');
const privateFeedback = await requestsRoute.GET(new Request(feedbackUrl, { headers: { cookie: cookie } }));
assert(!(await privateFeedback.text()).includes('مشتری نمونه'));
const feedbackResponse = await requestsRoute.GET(new Request(feedbackUrl, { headers: { cookie: authorizedCookie } }));
assert.equal(feedbackResponse.status, 200);
const feedbackHtml = await feedbackResponse.text();
assert(feedbackHtml.includes('ایده · مشتری نمونه'));
assert(feedbackHtml.includes('&lt;b&gt;پیام نمونه&lt;/b&gt;'));
const notificationUrl = requestsUrl.replace('view=requests', 'view=notification-feed');
const notificationRows = {
  contacts: [{ _id: 1, name: 'درخواست نمونه', createdAt: new Date(1000) }],
  meeting_answers: [{ _id: 2, doctorName: 'جلسه نمونه', updatedAt: new Date(2000) }],
  client_feedback: [{ _id: 3, clientName: 'بازخورد نمونه', createdAt: new Date(3000) }],
};
const notifications = load('lib/team-notifications.ts', {
  '@/lib/mongodb': { default: Promise.resolve({ db: () => ({
    collection: name => ({ find: () => ({
      sort() { return this; }, limit() { return this; },
      async toArray() { return notificationRows[name]; },
    }) }),
  }) }) },
});
const notificationRoute = load('app/blackhorse/route.ts', {
  '@/lib/team-auth': team, '@/lib/report-auth': auth, '@/lib/meeting-booking': booking,
  '@/lib/meeting-store': { listMeetings: async () => [] },
  '../../lib/team-notifications': notifications,
});
assert.equal((await notificationRoute.GET(new Request(notificationUrl, { headers: { cookie } }))).status, 401);
const feed = await notificationRoute.GET(new Request(notificationUrl, { headers: { cookie: authorizedCookie } }));
assert.equal(feed.status, 200);
assert.match(feed.headers.get('cache-control'), /no-store/);
assert.deepEqual((await feed.json()).items.map(item => item.view), ['feedback', 'meetings', 'requests']);
assert.match(feedbackHtml, /id="team-notification-toggle"/);
assert.match(feedbackHtml, /<nav class="team-nav team-menu-links"[^>]*>[\s\S]*?پاسخ جلسات[\s\S]*?<\/nav>/);
assert.doesNotMatch(feedbackHtml.match(/<nav class="app-tabs"[\s\S]*?<\/nav>/)[0], /پاسخ جلسات/);
const drawerLinks = feedbackHtml.match(/<nav class="team-nav team-menu-links"[^>]*>[\s\S]*?<\/nav>/)[0];
assert.doesNotMatch(drawerLinks, /view=(requests|analytics|shoots)/);

const loginPage=await teamRoute.GET(new Request('https://example.com/blackhorse'));
const nonce=(await loginPage.text()).match(/name="csrf" value="([a-f0-9]+)"/)[1];
const loginCookie=loginPage.headers.get('set-cookie').split(';')[0];
for(const origin of [null,'null','https://chatgpt.com']){
 const headers={cookie:loginCookie,'content-type':'application/x-www-form-urlencoded'};if(origin)headers.origin=origin;
 const response=await teamRoute.POST(new Request('https://example.com/blackhorse',{method:'POST',headers,body:new URLSearchParams({username:'romava',password:'team-test-password',csrf:nonce})}));
 assert.equal(response.status,303);assert(response.headers.get('set-cookie').startsWith('romava_team_session='));
}
env.ROMAVA_CREATOR_PASSWORD_HASH=auth.hash('creator-test-password');
const creatorLogin=await teamRoute.POST(new Request('https://example.com/blackhorse',{
 method:'POST',headers:{cookie:loginCookie},body:new URLSearchParams({username:'creator',password:'creator-test-password',csrf:nonce}),
}));
assert.equal(creatorLogin.status,303);
assert.equal(creatorLogin.headers.get('location'),'/blackhorse?view=shoots');
const creatorCookie=creatorLogin.headers.get('set-cookie').split(';')[0];
for(const view of ['requests','analytics','feedback','pricing','notification-feed','meetings']){
 assert.equal((await teamRoute.GET(new Request('https://example.com/blackhorse?view='+view,{headers:{cookie:creatorCookie}}))).status,403);
}
assert.equal((await teamRoute.POST(new Request('https://example.com/blackhorse',{
 method:'POST',headers:{cookie:creatorCookie},body:new URLSearchParams({action:'save-pricing',csrf:auth.hash(creatorCookie.split('=')[1]+':pricing')}),
}))).status,403);
const creatorQc=await teamRoute.GET(new Request('https://example.com/blackhorse?view=qc',{headers:{cookie:creatorCookie}}));
assert.equal(creatorQc.status,200);
assert.match(await creatorQc.text(),/روشن کردن حالت تست گوگل/);
const creatorQcWrite=await teamRoute.POST(new Request('https://example.com/blackhorse',{
 method:'POST',headers:{cookie:creatorCookie},body:new URLSearchParams({action:'analytics-test',enabled:'1',csrf:auth.hash(creatorCookie.split('=')[1]+':analytics-test')}),
}));
assert.equal(creatorQcWrite.status,303);
assert.equal(creatorQcWrite.headers.get('location'),'/blackhorse?view=qc');
const addendum=await teamRoute.GET(new Request('https://example.com/blackhorse?view=culture-addendum',{headers:{cookie:creatorCookie}}));
assert.equal(addendum.status,200);
const addendumHtml=await addendum.text();
assert.match(addendumHtml,/رازدار زره‌پوش/);
assert.match(addendumHtml,/href="\/culture"/);
assert.match(addendumHtml,/view=qc/);
assert.match(addendumHtml,/view=shoots/);
assert.doesNotMatch(addendumHtml,/view=(requests|analytics|pricing|feedback)|id="team-notification-toggle"/);
const setupProgress = new Map();
const onboarding = load('lib/onboarding.ts', {
 '@/lib/mongodb': { default: Promise.resolve({db:()=>({collection:()=>({
  findOne:async ({_id})=>setupProgress.get(_id) ?? null,
  updateOne:async ({_id,step}, {$set})=>{
   assert.equal(setupProgress.get(_id)?.step ?? 0, step);
   setupProgress.set(_id, $set);
   return {matchedCount:1};
  },
 })})}) },
});
const setupURL = 'https://example.com/r/onboarding';
const dashboardURL = '/r/sample?view=monthly';
const setupSession = 'sample-session';
const setupPost = (step, confirmed='1', csrf=auth.hash(setupSession+':dashboard-onboarding')) =>
 onboarding.dashboardOnboarding(new Request(setupURL,{method:'POST',body:new URLSearchParams({step,confirmed,csrf})}),'client','client:sample',setupSession,dashboardURL);
assert.equal((await onboarding.requireOnboarding('client','client:sample')).headers.get('location'),'/r/onboarding');
assert.equal((await setupPost('1')).headers.get('location'),'/r/onboarding');
assert.equal((await setupPost('0','0')).headers.get('location'),'/r/onboarding');
assert.equal((await setupPost('0','1','bad')).status,403);
assert.equal(setupProgress.size,0);
for(const [index,title] of ['شناخت و اصول همکاری','گزارش ماهانه','چک‌لیست آمادگی آفیش'].entries()){
 const current=await onboarding.dashboardOnboarding(new Request(setupURL),'client','client:sample',setupSession,dashboardURL);
 assert.ok((await current.text()).includes(title));
 assert.equal((await setupPost(String(index))).headers.get('location'),index===2 ? dashboardURL : '/r/onboarding');
}
assert.equal(await onboarding.requireOnboarding('client','client:sample'),null);
assert.equal((await onboarding.requireOnboarding('client','client:other')).status,303);
assert.equal((await onboarding.requireOnboarding('team','team:creator')).status,303);
const forged=await teamRoute.POST(new Request('https://example.com/blackhorse',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({username:'romava',password:'team-test-password',csrf:nonce})}));
assert(!forged.headers.get('set-cookie').startsWith('romava_team_session='));
console.log('PASS meeting sync: authenticated account, origin/validation, persistent readback, conflict protection, separate team session, tampering');})().catch(e=>{console.error(e);process.exitCode=1;});

assert.equal(booking.tehranToday(new Date('2026-11-08T21:00:00Z')),'2026-11-09');
const valid={plan:'bamboo',shootDate:'2026-11-11',shootSlot:'afternoon',paymentModel:'split',firstPaymentDate:'2026-11-08',secondPaymentDate:'2026-11-22'};
assert.equal(booking.validateBooking(valid,'2026-11-08').secondPaymentDate,'2026-11-22');
for(const patch of [{shootDate:'2026-11-09'},{shootDate:'2026-11-23'},{firstPaymentDate:'2026-11-07'},{firstPaymentDate:'2026-11-10'},{firstPaymentDate:'2026-11-11'},{shootDate:'2026-02-30'},{plan:'other'},{shootSlot:'night'},{paymentModel:'credit'}])assert.equal(booking.validateBooking({...valid,...patch},'2026-11-08'),null);
assert.equal(booking.validateBooking({...valid,paymentModel:'full'},'2026-11-08').secondPaymentDate,null);
assert.equal(booking.addDays('2026-12-25',14),'2027-01-08');assert.equal(booking.reportMeetingMonth({months:{'1':{},'2':{}}}),2);

const template=load('lib/meeting-template.ts',{'@/lib/meeting-booking':booking});
const html=template.meetingTemplate('a'.repeat(48),'synthetic','2026-11','csrf',2);new vm.Script(html.match(/<script>([\s\S]*)<\/script>/)[1]);assert(html.includes('بررسی ماه دوم و تمدید ماه سوم'));assert(html.includes('data-panel="7"'));assert(html.includes('phase-booking'));

assert(booking.validateBooking({...valid,shootDate:'2026-11-10'},'2026-11-08'));
assert(booking.validateBooking({...valid,shootDate:'2026-11-22'},'2026-11-08'));

for(const secondPaymentDate of [null,'2026-11-08','2026-11-07','2026-11-23'])assert.equal(booking.validateBooking({...valid,secondPaymentDate},'2026-11-08'),null);assert.equal(booking.validateBooking({...valid,secondPaymentDate:'2026-11-09'},'2026-11-08').secondPaymentDate,'2026-11-09');

assert.equal(booking.validateBooking({...valid,totalPrice:1,firstPaymentAmount:1},'2026-11-08').totalPrice,107000000);assert.equal(booking.validateBooking(valid,'2026-11-08').firstPaymentAmount,53500000);assert.equal(booking.validateBooking({...valid,paymentModel:'full'},'2026-11-08').firstPaymentAmount,107000000);assert.equal(booking.validateBooking({...valid,paymentModel:'full'},'2026-11-08').secondPaymentAmount,null);

assert(booking.validateBooking({...valid,firstPaymentDate:'2026-11-09'},'2026-11-08'));
