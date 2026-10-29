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
const env = { ROMAVA_REPORTS_CONFIG: JSON.stringify({ [hash(tokenA)]: reportA, [hash(tokenB)]: reportB }) };
function load(path, imports = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpile(fs.readFileSync(path, 'utf8'), { module: ts.ModuleKind.CommonJS }), {
    exports, require: name => imports[name] || require(name), process: { env }, Buffer, Response, Request, Date, URL,
  });
  return exports;
}
const auth = load('lib/report-auth.ts');
const login = load('lib/report-login.ts');
const admin = load('app/admin/route.ts', { '@/lib/report-login': login, '@/lib/report-auth': auth });
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
    assert.equal(valid.status, 303); assert.equal(valid.headers.get('location'), `/r/${report.token}`);
    const setCookie = valid.headers.get('set-cookie');
    for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Max-Age=28800', `Path=/r`]) assert(setCookie.includes(flag));
    const cookie = setCookie.split(';')[0];
    const result = await call(dashboard, `/r/${report.token}`, { cookie }); const html = await result.text();
    assert.equal(result.status, 200); assert(html.includes(report.data.marker)); assert(html.includes('خروج از حساب')); assert(!html.includes('__REPORT_DATA__'));
    const otherToken = report === reportA ? tokenB : tokenA;
    assert.equal((await call(dashboard, `/r/${otherToken}`, { cookie })).status, 303);
    assert.equal((await call(dashboard, `/r/${report.token}`, { cookie: cookie + 'bad' })).status, 303);
    const logout = await call(dashboard, `/r/${report.token}`, { method: 'POST', cookie, action: 'logout' }); assert.equal(logout.status, 303); assert.equal(logout.headers.get('location'), '/admin'); assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
  }
  const firstLogin = await call(admin, '/admin', { method: 'POST', username: reportA.data.name, password: 'test-a-strong-password' });
  const secondLogin = await call(admin, '/admin', { method: 'POST', username: reportB.data.name, password: 'test-b-strong-password' });
  const firstCookie = firstLogin.headers.get('set-cookie').split(';')[0];
  const secondCookie = secondLogin.headers.get('set-cookie').split(';')[0];
  assert.equal(firstCookie.split('=')[0], secondCookie.split('=')[0]);
  assert.equal((await call(dashboard, `/r/${tokenA}`, { cookie: secondCookie })).status, 303);
  assert.equal((await call(dashboard, `/r/${tokenB}`, { cookie: secondCookie })).status, 200);
  assert.equal((await call(admin, '/admin', { method: 'POST', username: reportA.data.name, password: 'test-a-strong-password', omitCsrf: true })).status, 403);
  assert.equal((await call(admin, '/admin', { method: 'POST', username: reportA.data.name, password: 'test-a-strong-password', origin: 'null' })).status, 303);
  assert.equal((await call(dashboard, `/r/${'c'.repeat(48)}`)).status, 404);
  env.ROMAVA_REPORTS_CONFIG = '{'; assert.equal((await call(admin, '/admin', { method: 'POST', username: 'a', password: 'b' })).status, 503);
  console.log('PASS: one private login page, both doctor routes, wrong/legacy/cross-report credentials, signed cookie flags, isolation, tampering, logout, CSRF token, 404/503');
})().catch(error => { console.error(error); process.exitCode = 1; });
