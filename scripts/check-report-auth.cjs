// Run with: node scripts/check-report-auth.cjs. Uses synthetic reports only.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ts = require('typescript');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const tokenA = 'a'.repeat(48), tokenB = 'b'.repeat(48);
const reports = {
  [hash(tokenA)]: { passwordHash: hash('test-a-strong-password'), data: { name: 'نمونه یک', marker: 'PRIVATE_REPORT_A' } },
  [hash(tokenB)]: { passwordHash: hash('test-b-strong-password'), data: { name: 'نمونه دو', marker: 'PRIVATE_REPORT_B' } },
};
const env = { ROMAVA_REPORTS_CONFIG: JSON.stringify(reports) };
function load(path, imports = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpile(fs.readFileSync(path, 'utf8'), { module: ts.ModuleKind.CommonJS }), {
    exports, require: name => imports[name] || require(name), process: { env }, Buffer, Response, Request, Date, URL,
  });
  return exports;
}
const route = load('app/r/[token]/route.ts', {
  '@/lib/report-template': load('lib/report-template.ts'),
  '@/lib/report-login': load('lib/report-login.ts'),
});
function call(token, { method = 'GET', username, password, cookie, origin = 'https://example.com', action } = {}) {
  const url = `https://example.com/r/${token}`;
  const headers = {};
  if (cookie) headers.cookie = cookie;
  if (method === 'POST') { headers.origin = origin; headers['content-type'] = 'application/x-www-form-urlencoded'; }
  return route[method](new Request(url, { method, headers, ...(method === 'POST' ? { body: new URLSearchParams({ username: username || '', password: password || '', ...(action ? { action } : {}) }) } : {}) }), { params: Promise.resolve({ token }) });
}
(async () => {
  const login = await call(tokenA), loginHtml = await login.text();
  assert.equal(login.status, 200); assert.match(loginHtml, /autocomplete="username"/); assert(!loginHtml.includes('PRIVATE_REPORT_A')); assert(!loginHtml.includes('نمونه یک')); assert(!login.headers.has('www-authenticate'));
  for (const input of [{ username: 'report', password: 'test-a-strong-password' }, { username: 'نمونه یک', password: 'wrong' }, { username: 'نمونه دو', password: 'test-b-strong-password' }]) {
    const result = await call(tokenA, { method: 'POST', ...input }); assert.equal(result.status, 401); assert(!result.headers.has('www-authenticate')); assert(!(await result.text()).includes('PRIVATE_REPORT_A'));
  }
  const valid = await call(tokenA, { method: 'POST', username: ' دکتر نمونه  يک ', password: 'test-a-strong-password' });
  assert.equal(valid.status, 303); const setCookie = valid.headers.get('set-cookie');
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Max-Age=28800', `Path=/r/${tokenA}`]) assert(setCookie.includes(flag));
  const cookie = setCookie.split(';')[0];
  const report = await call(tokenA, { cookie }); const html = await report.text();
  assert(html.includes('PRIVATE_REPORT_A')); assert(!html.includes('PRIVATE_REPORT_B')); assert(html.includes('خروج از حساب')); assert(!html.includes('__REPORT_DATA__')); assert.match(report.headers.get('cache-control'), /no-store/);
  assert(!(await (await call(tokenB, { cookie })).text()).includes('PRIVATE_REPORT_B'));
  assert(!(await (await call(tokenA, { cookie: cookie + 'bad' })).text()).includes('PRIVATE_REPORT_A'));
  const expired = String(Math.floor(Date.now() / 1000) - 1);
  const mac = crypto.createHmac('sha256', reports[hash(tokenA)].passwordHash).update(JSON.stringify(['report-session-v1', tokenA, 'نمونه یک', expired])).digest('hex');
  assert(!(await (await call(tokenA, { cookie: `${cookie.split('=')[0]}=${expired}.${mac}` })).text()).includes('PRIVATE_REPORT_A'));
  const logout = await call(tokenA, { method: 'POST', cookie, action: 'logout' }); assert.equal(logout.status, 303); assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
  assert.equal((await call(tokenA, { method: 'POST', username: 'نمونه یک', password: 'test-a-strong-password', origin: 'https://evil.example' })).status, 403);
  assert.equal((await call('c'.repeat(48))).status, 404);
  reports[hash(tokenA)].passwordHash = hash('changed-password'); env.ROMAVA_REPORTS_CONFIG = JSON.stringify(reports);
  assert(!(await (await call(tokenA, { cookie })).text()).includes('PRIVATE_REPORT_A'));
  env.ROMAVA_REPORTS_CONFIG = '{'; assert.equal((await call(tokenA)).status, 503);
  console.log('PASS: private login page, incorrect/legacy/cross-report credentials, Persian name normalization, signed cookie flags, redirect, report isolation, tampered/expired/revoked sessions, logout, CSRF origin, 404/503, privacy headers');
})().catch(error => { console.error(error); process.exitCode = 1; });
