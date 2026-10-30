# Private plans in doctor dashboards

`/plans` redirects to `/r/plans`. All signed-in doctors can view plans using their existing report session. The session cookie stays scoped to `/r`; no new password or wider cookie scope is needed. Anonymous or expired sessions redirect to `/admin`.

The dashboard links to plans, and plans link back to the authenticated doctor's own dashboard. Responses retain noindex, nofollow, noarchive and private, no-store. The old ROMAVA_PLANS_PASSWORD is no longer used.
