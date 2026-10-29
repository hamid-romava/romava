# Private report dashboards

`GET /admin` is the single Persian sign-in page. Visitors enter each doctor's Persian name and existing generated password. The name accepts an optional «دکتر» prefix, Arabic/Persian variants of ی and ک, and extra spaces. A successful login redirects to that doctor's private dashboard. The login HTML contains no report data or doctor names.

Each private report lives at `/r/<48-character random token>`. Without a session, the report URL redirects to `/admin`. The report path remains unlisted and validates a report-specific, eight-hour signed cookie. Cookies are HttpOnly, SameSite=Strict, scoped to `/r`, and Secure on HTTPS. Logout requires the active report session, clears the cookie, and redirects to `/admin`. Password/name changes revoke existing sessions. The shared login form uses a short-lived, same-site CSRF cookie and matching hidden form token; it works when a browser omits or rewrites the Origin header.

Set `ROMAVA_REPORTS_CONFIG` in Vercel Production and Preview. It is a JSON object keyed by each random URL token's SHA-256 digest. Each entry must include `token` (the URL token), `passwordHash` (SHA-256 of the strong generated password) and `data` (shared-template report fields). The server verifies each token against its digest. Report data and credentials must never be committed to this public repository. `.env.local` is ignored by Git.

Unknown report tokens return 404. Incorrect credentials return the shared login page with a generic error and status 401, without WWW-Authenticate or report data. All report responses disable caching, indexing, framing, and referrer disclosure. Authentication compares password hashes and session signatures in constant time. Use HTTPS and strong generated passwords in production.

Validation includes the production build, shared login form, successful and failed login, report isolation, tampered/expired sessions, logout, Origin enforcement, privacy headers, and existing homepage/font availability.
