# Password-protected report dashboards

`GET /r/<48-character random token>` serves a standalone dashboard after HTTP Basic authentication. The username is `report`; each report has a separate generated password. The browser displays its standard sign-in dialog.

Set `ROMAVA_REPORTS_CONFIG` in the hosting environment. Its value is a JSON object keyed by the SHA-256 digest of each random URL token. Each entry contains `passwordHash` (SHA-256 of a strong generated password) and `data` (the report fields used by the shared template). Report data and credentials must never be committed to this public repository. The local `.env.local` is ignored by Git.

Unknown tokens return 404. Missing or incorrect credentials return 401 without report data. Successful responses use `Cache-Control: private, no-store`, `X-Robots-Tag: noindex, nofollow, noarchive`, and `Referrer-Policy: no-referrer`. Authentication uses constant-time hash comparison. Use HTTPS in production. There is no public report index or report selector.

Deploy the source through the existing Vercel project after adding the environment variable to Production (and Preview if needed), then redeploy. To revoke or change access, update the token digest or password hash in the environment variable and redeploy. Generated passwords have 144 bits of entropy; this implementation is intended for strong generated passwords, not short human-chosen passwords.

Validation: production build; HTTP checks for missing, wrong, cross-report and correct passwords; unknown tokens; response privacy headers; homepage and font availability.
