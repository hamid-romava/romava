// Run with: node scripts/check-report-auth.cjs. Synthetic reports only.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ts = require('typescript');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const tokenA = 'a'.repeat(48), tokenB = 'b'.repeat(48);
const reportA = { token: tokenA, passwordHash: hash('test-a-strong-password'), data: { name: 'نمونه یک', marker: 'PRIVATE_REPORT_A' } };
const reportB = { token: tokenB, passwordHash: hash('test-b-strong-password'), data: { name: 'نمونه دو', marker: 'PRIVATE_REPORT_B' } };
reportA.months = { '1': { ...reportA.data, period: 'ماه اول', followerGain: 111 }, '2': { ...reportA.data, period: 'ماه دوم', followerGain: 222 } };
const env = { ROMAVA_REPORTS_CONFIG: JSON.stringify({ [hash(tokenA)]: reportA, [hash(tokenB)]: reportB }) };
const setupProgress = new Map();
const dashboardStorage = { default: Promise.resolve({db:()=>({collection:()=>({
  findOne:async ({_id})=>setupProgress.get(_id) ?? null,
  updateOne:async ({_id,step,password}, {$set,$setOnInsert}, options)=>{
    const row=setupProgress.get(_id);
    if (password && row?.password) throw Object.assign(new Error('duplicate'),{code:11000});
    if (step !== undefined && row?.step !== step) return {matchedCount:0,upsertedCount:0};
    if (!row && !options?.upsert) return {matchedCount:0,upsertedCount:0};
    setupProgress.set(_id,{...row,...(!row && $setOnInsert),...$set});
    return {matchedCount:row ? 1 : 0,upsertedCount:row ? 0 : 1};
  },
})})}) };
function load(path, imports = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpile(fs.readFileSync(path, 'utf8'), { module: ts.ModuleKind.CommonJS }), {
    exports, require: name => imports[name] || (name === "@/lib/mongodb" ? dashboardStorage : null) || (name.endsWith("/onboarding") ? { requireOnboarding: async () => null } : null) || (name.startsWith(".") ? load(require("node:path").resolve(require("node:path").dirname(path),name)+".ts") : require(name)), process: { env }, Buffer, Response, Request, Date, URL,
  });
  return exports;
}
const booking = load('lib/meeting-booking.ts');
const auth = load('lib/report-auth.ts');
const login = load('lib/report-login.ts');
const admin = load('app/admin/route.ts', { '@/lib/report-login': login, '@/lib/report-auth': auth });
const meeting = load('app/r/meeting/route.ts', { '../../../lib/pricing-store': { getPricing: async () => load('lib/pricing-plans.ts').defaultPricing }, '@/lib/meeting-template': load('lib/meeting-template.ts', { '@/lib/meeting-booking': booking }), '@/lib/report-auth': auth, '@/lib/meeting-booking': booking, '@/lib/meeting-store': { currentCycle: () => '2026-11' } });
const preparation = load('app/r/preparation/route.ts', { '@/lib/preparation-template': load('lib/preparation-template.ts'), '@/lib/report-auth': auth });
const dashboard = load('app/r/[token]/route.ts', { '@/lib/report-template': load('lib/report-template.ts'), '@/lib/report-auth': auth });
async function call(route, path, { method = 'GET', username, password, cookie, origin, action, omitCsrf = false } = {}) {
  const url = `https://example.com${path}`;
  const headers = {};
  let csrf = '';
  if (route === admin && method === 'POST' && !omitCsrf) {
    const page = await admin.GET(new Request(url));
    csrf = (await page.text()).match(/name="csrf" value="([a-f0-9]{48})"/)[1];
    cookie = page.headers.get('set-cookie').split(';')[0];
  }
  if (cookie) headers.cookie = cookie;
  if (method === 'POST') { if (origin) headers.origin = origin; headers['content-type'] = 'application/x-www-form-urlencoded'; }
  const request = new Request(url, { method, headers, ...(method === 'POST' ? { body: new URLSearchParams({ username: username || '', password: password || '', ...(action ? { action } : {}), ...(csrf ? { csrf } : {}) }) } : {}) });
  return route === admin ? route[method](request) : route[method](request, { params: Promise.resolve({ token: path.split('/').pop() }) });
}
(async () => {
  const page = await call(admin, '/admin'), loginHtml = await page.text();
  assert.equal(page.status, 200); assert.match(loginHtml, /autocomplete="username"/); assert(!loginHtml.includes('PRIVATE_REPORT_A')); assert(!loginHtml.includes('نمونه یک')); assert(!page.headers.has('www-authenticate'));
  for (const input of [{ username: 'report', password: 'test-a-strong-password' }, { username: 'نمونه یک', password: 'wrong' }, { username: 'نمونه یک', password: 'test-b-strong-password' }]) {
    const result = await call(admin, '/admin', { method: 'POST', ...input }); assert.equal(result.status, 401); assert(!(await result.text()).includes('PRIVATE_REPORT_A'));
  }
  for (const [report, password] of [[reportA, 'test-a-strong-password'], [reportB, 'test-b-strong-password']]) {
    const oldUrl = await call(dashboard, `/r/${report.token}`); assert.equal(oldUrl.status, 303); assert.equal(oldUrl.headers.get('location'), '/admin');
    const valid = await call(admin, '/admin', { method: 'POST', username: `دکتر ${report.data.name}`, password });
    assert.equal(valid.status, 303); assert.equal(valid.headers.get('location'), `/r/${report.token}?view=monthly`);
    const setCookie = valid.headers.get('set-cookie');
    for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Max-Age=28800', `Path=/r`]) assert(setCookie.includes(flag));
    const cookie = setCookie.split(';')[0];
    const result = await dashboard.GET(new Request(`https://example.com/r/${report.token}${report.months ? '?month=1' : ''}`, { headers: { cookie } }), { params: Promise.resolve({ token: report.token }) }); const html = await result.text();
    assert.equal(result.status, 200); assert(html.includes(report.data.marker)); assert(html.includes('خروج از حساب')); assert(html.includes('href="/r/onboarding?view=password"')); assert(!html.includes('__REPORT_DATA__'));
    const otherToken = report === reportA ? tokenB : tokenA;
    assert.equal((await call(dashboard, `/r/${otherToken}`, { cookie })).status, 303);
    assert.equal((await call(dashboard, `/r/${report.token}`, { cookie: cookie + 'bad' })).status, 303);
    const logout = await call(dashboard, `/r/${report.token}`, { method: 'POST', cookie, action: 'logout' }); assert.equal(logout.status, 303); assert.equal(logout.headers.get('location'), '/admin'); assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
  }
  const firstLogin = await call(admin, '/admin', { method: 'POST', username: reportA.data.name, password: 'test-a-strong-password' });
  const secondLogin = await call(admin, '/admin', { method: 'POST', username: reportB.data.name, password: 'test-b-strong-password' });
  const firstCookie = firstLogin.headers.get('set-cookie').split(';')[0];
  assert.equal((await preparation.GET(new Request('https://example.com/r/preparation'))).status, 303);
  for (const [report, loginResponse] of [[reportA, firstLogin], [reportB, secondLogin]]) {
    const response = await preparation.GET(new Request('https://example.com/r/preparation', { headers: { cookie: loginResponse.headers.get('set-cookie').split(';')[0] } }));
    assert.equal(response.status, 200);
    const html = await response.text();
    assert(html.includes('/r/' + report.token));
    assert(html.includes(auth.hash('preparation-v1:' + report.token)));
    assert.equal((html.match(/type="checkbox"/g) || []).length, 12);
    assert(response.headers.get('Cache-Control').includes('no-store'));
  }
  const secondCookie = secondLogin.headers.get('set-cookie').split(';')[0];
  assert.equal(firstCookie.split('=')[0], secondCookie.split('=')[0]);
  assert.equal((await call(dashboard, `/r/${tokenA}`, { cookie: secondCookie })).status, 303);
  assert.equal((await call(dashboard, `/r/${tokenB}`, { cookie: secondCookie })).status, 200);
  assert.equal((await call(admin, '/admin', { method: 'POST', username: reportA.data.name, password: 'test-a-strong-password', omitCsrf: true })).status, 403);
  assert.equal((await call(admin, '/admin', { method: 'POST', username: reportA.data.name, password: 'test-a-strong-password', origin: 'null' })).status, 303);
  assert.equal((await call(dashboard, `/r/${'c'.repeat(48)}`)).status, 404);
  assert.equal((await meeting.GET(new Request('https://example.com/r/meeting'))).status, 303);
  for (const [report, loginResponse] of [[reportA, firstLogin], [reportB, secondLogin]]) {
    const response = await meeting.GET(new Request('https://example.com/r/meeting', { headers: { cookie: loginResponse.headers.get('set-cookie').split(';')[0] } }));
    assert.equal(response.status, 200);
    const html = await response.text();
    assert(html.includes('/r/' + report.token));
    assert(html.includes(auth.hash('meeting-v1:' + report.token)));
    assert(!html.includes(auth.hash('meeting-v1:' + (report === reportA ? tokenB : tokenA))));
    assert.equal((html.match(/<textarea /g) || []).length, 5);
    assert(response.headers.get('Cache-Control').includes('no-store'));
  }
  const monthCookie = firstLogin.headers.get('set-cookie').split(';')[0];
  const monthOne = await dashboard.GET(new Request(`https://example.com/r/${tokenA}?month=1`, { headers: { cookie: monthCookie } }), { params: Promise.resolve({ token: tokenA }) });
  assert.equal(monthOne.status, 200);
  const monthHtml = await monthOne.text();
  assert(monthHtml.includes('"followerGain":111'));
  assert(!monthHtml.includes('"followerGain":222'));
  const defaultMonth = await dashboard.GET(new Request(`https://example.com/r/${tokenA}`, { headers: { cookie: monthCookie } }), { params: Promise.resolve({ token: tokenA }) });
  const overview = await defaultMonth.text();
  assert(overview.includes('گزارش کلی عملکرد'));
  assert(overview.includes('۳۳۳'));
  const chooser = await dashboard.GET(new Request(`https://example.com/r/${tokenA}?view=monthly`, { headers: { cookie: monthCookie } }), { params: Promise.resolve({ token: tokenA }) });
  assert((await chooser.text()).includes('گزارش کدوم ماه رو می‌خوای؟'));
  assert.equal((await dashboard.GET(new Request(`https://example.com/r/${tokenA}?month=3`, { headers: { cookie: monthCookie } }), { params: Promise.resolve({ token: tokenA }) })).status, 404);
  assert.equal((await dashboard.GET(new Request(`https://example.com/r/${tokenB}?month=1`, { headers: { cookie: monthCookie } }), { params: Promise.resolve({ token: tokenB }) })).status, 303);
  env.ROMAVA_REPORT_LOGIN_NAMES = JSON.stringify({ [hash(tokenA)]: 'نمونه نام خانوادگی' });
  const renamed = await call(admin, '/admin', { method: 'POST', username: 'نمونه نام خانوادگی', password: 'test-a-strong-password' });
  assert.equal(renamed.status, 303);
  assert.equal(renamed.headers.get('location'), '/r/' + tokenA + '?view=monthly');
  assert.equal((await call(admin, '/admin', { method: 'POST', username: reportA.data.name, password: 'test-a-strong-password' })).status, 401);
  const onboarding = load('app/r/onboarding/route.ts', {
    '../../../lib/onboarding': load('lib/onboarding.ts'),
    '../../../lib/report-auth': auth,
  });
  const setupUrl = 'https://example.com/r/onboarding';
  const setupRequest = new Request(setupUrl, {headers:{cookie:monthCookie}});
  const setupHtml = await (await onboarding.GET(setupRequest)).text();
  assert.match(setupHtml,/name="new-password"/);
  const csrf = setupHtml.match(/name="csrf" value="([a-f0-9]+)"/)[1];
  const password = 'رمزtest۱';
  const rotate = (overrides={}) => onboarding.POST(new Request(setupUrl,{method:'POST',headers:{cookie:monthCookie},body:new URLSearchParams({
    csrf,step:'0','current-password':'test-a-strong-password','new-password':password,'confirm-password':password,...overrides,
  })}));
  assert.equal((await rotate({csrf:'wrong'})).status,403);
  assert.equal((await rotate({'confirm-password':'wrong'})).status,400);
  assert.equal((await rotate({'current-password':'wrong'})).status,400);
  assert.equal((await rotate({'new-password':'short'})).status,400);
  for (const invalid of ['abcdef1', 'abcdefgh', '12345678']) {
    assert.equal((await rotate({'new-password':invalid, 'confirm-password':invalid})).status,400);
  }
  const rotated = await rotate();
  assert.equal(rotated.headers.get('location'),'/r/onboarding');
  const rotatedCookie = rotated.headers.get('set-cookie').split(';')[0];
  assert.equal((await call(dashboard, `/r/${tokenA}`, {cookie:monthCookie})).headers.get('location'),'/admin');
  assert.equal((await call(dashboard, `/r/${tokenA}`, {cookie:rotatedCookie})).status,200);
  assert.equal((await call(admin,'/admin',{method:'POST',username:'نمونه نام خانوادگی',password:'test-a-strong-password'})).status,401);
  assert.equal((await call(admin,'/admin',{method:'POST',username:'نمونه نام خانوادگی',password})).status,303);
  assert.equal((await call(dashboard,`/r/${tokenB}`,{cookie:secondCookie})).status,200);
  env.ROMAVA_REPORTS_CONFIG = '{'; assert.equal((await call(admin, '/admin', { method: 'POST', username: 'a', password: 'b' })).status, 503);
  console.log('PASS: one private login page, both doctor routes, wrong/legacy/cross-report credentials, signed cookie flags, isolation, tampering, logout, CSRF token, 404/503');
})().catch(error => { console.error(error); process.exitCode = 1; });
