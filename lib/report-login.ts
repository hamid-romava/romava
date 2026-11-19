// This public sign-in page deliberately contains no client report data.
export function loginTemplate(csrfToken: string, error = false) {
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="theme-color" content="#fafbfe">
  <link rel="icon" href="/brand/romava-symbol-focus.svg" type="image/svg+xml">
  <title>ورود به داشبورد | روماوا</title>
  <style>
    @font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Regular.ttf') format('truetype');font-weight:400;font-display:swap}
    @font-face{font-family:Yekan;src:url('/fonts/YekanBakh-Bold.ttf') format('truetype');font-weight:700;font-display:swap}
    *{box-sizing:border-box}
    body{margin:0;background:linear-gradient(145deg,#e5ebff,#f7f8fd 57%,#fff4cf);color:#1e2636;font-family:Yekan,Arial,sans-serif;line-height:1.6}
    main{min-height:100vh;min-height:100svh;display:grid;place-items:center;padding:32px 24px}
    .login{width:min(100%,350px)}
    header{text-align:center;margin-bottom:32px}
    .brand{display:block;width:104px;height:auto;margin:0 auto 20px}
    h1{font-size:clamp(25px,5vw,32px);line-height:1.35;margin:0}
    form{display:grid;gap:16px}
    label{display:block;font-size:14px;margin-bottom:6px}
    button,input{font:inherit}
    input{width:100%;min-height:52px;padding:10px 14px;border:1px solid #d8dfec;border-radius:13px;background:#fff;color:inherit;font-size:16px}
    input::placeholder{color:#687487}
    :is(button,input,a):focus-visible{outline:2px solid #254fe9;outline-offset:3px}
    .password-wrap{position:relative}
    .password-wrap input{padding-inline-end:72px}
    .toggle{position:absolute;inset-inline-end:5px;inset-block-start:50%;transform:translateY(-50%);min-height:44px;padding:0 10px;border:0;border-radius:9px;background:transparent;color:#48576d;font-size:13px;cursor:pointer}
    .submit{min-height:52px;width:100%;border:0;border-radius:13px;background:#254fe9;color:#fff;font-weight:700;cursor:pointer}
    .submit:hover{background:#1e42c5}
    .submit:disabled{opacity:.65;cursor:wait}
    .error{margin:0;padding:10px 12px;border-radius:10px;background:#fff0ef;color:#9b2b23;font-size:14px}
    .home{display:table;margin:20px auto 0;padding:10px 12px;color:#48576d;font-size:14px;text-decoration:none}
    .home:hover{text-decoration:underline}
  </style>
</head>
<body>
  <main>
    <section class="login" aria-labelledby="login-title">
      <header>
        <img class="brand" src="/brand/romava-logo-focus.svg" alt="روماوا">
        <h1 id="login-title">ورود به داشبورد</h1>
      </header>
      <form method="post" id="login-form">
        <input type="hidden" name="csrf" value="${csrfToken}">
        ${error ? '<p class="error" role="alert">نام کاربری یا رمز عبور درست نیست.</p>' : ''}
        <div>
          <label for="username">نام و نام خانوادگی</label>
          <input id="username" name="username" autocomplete="username" placeholder="اسم و فامیلت به فارسی" required maxlength="100" spellcheck="false" autocapitalize="none">
        </div>
        <div>
          <label for="password">رمز عبور</label>
          <div class="password-wrap">
            <input id="password" name="password" type="password" autocomplete="current-password" required maxlength="256">
            <button class="toggle" type="button" id="toggle-password" aria-controls="password">نمایش</button>
          </div>
        </div>
        <button class="submit" type="submit">ورود</button>
      </form>
      <a class="home" href="/">برگشت به سایت</a>
    </section>
  </main>
  <script>
    const form = document.getElementById('login-form');
    const password = document.getElementById('password');
    const toggle = document.getElementById('toggle-password');
    const submit = form.querySelector('.submit');
    toggle.addEventListener('click', () => {
      const reveal = password.type === 'password';
      password.type = reveal ? 'text' : 'password';
      toggle.textContent = reveal ? 'پنهان' : 'نمایش';
    });
    form.addEventListener('submit', () => {
      submit.disabled = true;
      submit.textContent = 'در حال ورود…';
    });
    window.addEventListener('pageshow', () => {
      submit.disabled = false;
      submit.textContent = 'ورود';
    });
  </script>
</body>
</html>`;
}
