# Private report dashboards

`GET /r/<48-character random token>` shows a Persian sign-in page inside the site. Each report uses the doctor's Persian `data.name` as its username and its existing generated password. Names accept an optional «دکتر» prefix, Arabic/Persian variants of ی and ک, and extra spaces. No report data or doctor name is included in the public sign-in HTML.

`POST` to the same URL validates the form, then redirects back with an eight-hour, signed, report-specific session cookie. Cookies are HttpOnly, SameSite=Strict, scoped to the report path, and Secure on HTTPS. Logout clears that report's cookie. Password/name changes revoke existing sessions. Basic authentication is no longer used, so browsers do not show a credential popup. POST requests require a matching Origin.

Set `ROMAVA_REPORTS_CONFIG` in Vercel Production and Preview. It is a JSON object keyed by the SHA-256 digest of each random URL token, containing `passwordHash` (SHA-256 of a strong generated password) and `data` (shared-template report fields). Report data and credentials must never be committed to this public repository. `.env.local` is ignored by Git.

Unknown tokens return 404. Incorrect credentials return the sign-in page with a generic error and status 401, without WWW-Authenticate or report data. All report responses disable caching, indexing, framing, and referrer disclosure. Authentication compares password hashes and session signatures in constant time. Use HTTPS and strong generated passwords in production. There is no public report index or report selector.

Validation includes the production build, sign-in form, successful and failed login, report isolation, tampered/expired sessions, logout, Origin enforcement, privacy headers, and existing homepage/font availability.
