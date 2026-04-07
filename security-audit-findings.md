# Security Audit Report — BurqaHijab.shop

**Date:** 2026-04-07  
**Auditor:** Automated deploy-security scan + manual review  
**Project:** `/home/z/my-project` (Next.js 16, TypeScript, Prisma + SQLite)  
**Scan Tool:** `security_scan.py` + reference-guided manual grep/read analysis

---

## Executive Summary

BurqaHijab.shop is a Next.js e-commerce admin panel backed by SQLite via Prisma. The audit uncovered **critical security gaps** that make the application **unsafe for production deployment** without remediation.

**The three most urgent findings are:**

1. **All 13 admin API routes are completely unprotected** — anyone on the internet can read, create, update, and delete all products, orders, categories, collections, testimonials, and trigger a full database wipe via the `/api/admin/seed` endpoint.
2. **The `.env` file (containing the database path) is committed to git** — present since the initial commit (`186ec3c`). It will persist in history even after gitignore rules.
3. **A hardcoded fallback admin password `'bhq2026'`** is embedded in source code and will be visible in the deployed JavaScript bundle if the environment variable is unset.

**Overall Security Score: 32 / 100** — Critical remediation required before any production deployment.

---

## Category Scores

| # | Category                | Score (0-10) | Grade |
|---|-------------------------|:------------:|-------|
| 1 | Secrets & API Keys      |      2       | 🔴 F   |
| 2 | Input Validation         |      4       | 🟡 D   |
| 3 | Authentication & AuthZ   |      1       | 🔴 F   |
| 4 | Database Security       |      6       | 🟡 D   |
| 5 | Firebase                 |    N/A       | —     |
| 6 | Supabase                 |    N/A       | —     |
| 7 | Security Headers         |      2       | 🔴 F   |
| 8 | Rate Limiting            |      1       | 🔴 F   |
| 9 | Dependencies             |      7       | 🟢 C   |
|10 | File Uploads             |    N/A       | —     |
|11 | Error Handling           |      4       | 🟡 D   |
|12 | CORS                     |      2       | 🔴 F   |
|   | **Weighted Overall**     | **32/100**   | 🔴 F   |

---

## Detailed Findings

---

### 1. Secrets & API Keys — Score: 2/10

#### SEC-01 🔴 CRITICAL — `.env` file committed to git
- **File:** `.env` (tracked since initial commit `186ec3c`)
- **Evidence:** `git ls-files .env` returns `.env`; `git log --oneline -1 -- .env` confirms history.
- **Content:** `DATABASE_URL=file:/home/z/my-project/db/custom.db`
- **Impact:** Database path exposed to anyone with repo access. Even after removal from staging, it persists in git history.
- **Fix:** Run `git rm --cached .env`, then `git filter-repo --invert-paths --path .env` to scrub history.

#### SEC-02 🔴 CRITICAL — Hardcoded fallback admin password
- **File:** `src/app/api/admin/auth/route.ts:13`
- **Code:** `const adminPassword = process.env.ADMIN_PASSWORD || 'bhq2026';`
- **Impact:** If `ADMIN_PASSWORD` env var is not set, the password is the trivially guessable string `bhq2026`. The fallback is hardcoded in server code.
- **Fix:** Remove the fallback. Fail with 500 if the env var is not set: `const adminPassword = process.env.ADMIN_PASSWORD; if (!adminPassword) throw new Error('ADMIN_PASSWORD not configured');`

#### SEC-03 🟡 WARNING — `ADMIN_PASSWORD` not set in `.env`
- **File:** `.env`
- **Impact:** The only env var in `.env` is `DATABASE_URL`. `ADMIN_PASSWORD` is absent, meaning the hardcoded fallback `bhq2026` is always used.
- **Fix:** Add `ADMIN_PASSWORD=<strong-random-password>` to `.env` and set on production host.

#### SEC-04 🟡 WARNING — No `.env.example` file
- **Impact:** No documentation of required environment variables for team onboarding.
- **Fix:** Create `.env.example` with `DATABASE_URL=` and `ADMIN_PASSWORD=` placeholders.

---

### 2. Input Validation — Score: 4/10

#### VAL-01 🟡 WARNING — No Zod/schema validation on API inputs
- **Files:** All 13 API route files under `src/app/api/`
- **Impact:** Request bodies are destructured directly without type/schema validation. Malformed or unexpected data types (e.g., `price: "abc"`, arrays instead of strings) can cause unhandled exceptions or write corrupt data to the database.
- **Example:** In `src/app/api/admin/products/route.ts:112-137`, the body is destructured and used without any `z.object().safeParse()`.
- **Fix:** Add Zod schemas for each route's input and call `.safeParse()` before processing.

#### VAL-02 🟡 WARNING — `dangerouslySetInnerHTML` in chart component
- **File:** `src/components/ui/chart.tsx:83`
- **Code:** `dangerouslySetInnerHTML={{ __html: Object.entries(THEMES)... }}`
- **Impact:** Low risk — the content is generated from a constant `THEMES` object, not user input. However, it could be a vector if the component is refactored to accept dynamic themes.
- **Fix:** Monitor but acceptable for now.

#### VAL-03 🟢 INFO — Prisma ORM prevents SQL injection
- **Impact:** All database queries use Prisma's type-safe query builder. No `$queryRaw`, `$queryRawUnsafe`, or `$executeRaw` calls found.
- **Status:** No action needed.

---

### 3. Authentication & Authorization — Score: 1/10

#### AUTH-01 🔴 CRITICAL — Zero authentication on all 13 admin API routes
- **Files:** Every file under `src/app/api/admin/`
- **Impact:** Any unauthenticated user can:
  - `GET /api/admin/products` — read entire product catalog
  - `POST /api/admin/products` — create new products
  - `PUT /api/admin/products/[id]` — modify any product
  - `DELETE /api/admin/products/[id]` — delete any product
  - `GET /api/admin/orders` — read all customer orders (PII: names, emails, addresses, phone numbers)
  - `POST /api/admin/orders` — create fraudulent orders
  - `PATCH /api/admin/orders` — change order status/payment status
  - `DELETE /api/admin/orders` — delete order records
  - `POST /api/admin/seed` — **WIPE AND RESEED THE ENTIRE DATABASE**
  - Same for categories, collections, testimonials, dashboard stats
- **Fix:** Create middleware or a shared auth guard that:
  1. Reads a session token or Authorization header
  2. Validates it against `ADMIN_PASSWORD` (or better, a JWT/hashed session)
  3. Rejects unauthenticated requests with 401
  4. Apply to all `/api/admin/*` routes

#### AUTH-02 🔴 CRITICAL — Plaintext password comparison, no hashing
- **File:** `src/app/api/admin/auth/route.ts:15`
- **Code:** `if (password !== adminPassword)` — direct string comparison
- **Impact:** The password is never hashed. If the database is compromised or logs capture the comparison, the password is exposed.
- **Fix:** Use `bcrypt.compare()` (install `bcryptjs`). Store a hashed password in the env var or database.

#### AUTH-03 🔴 CRITICAL — No session/token management
- **Impact:** The auth endpoint returns `{ success: true }` with no session token, JWT, or cookie. The client must re-send the password with every request, which means:
  - The password is transmitted repeatedly (increases interception risk)
  - There is no session expiration
  - There is no session invalidation
  - There is no way to track "logged in" state
- **Fix:** Issue a signed JWT or session cookie on successful auth.

#### AUTH-04 🔴 CRITICAL — No brute force protection on login
- **File:** `src/app/api/admin/auth/route.ts`
- **Impact:** An attacker can try unlimited passwords per second with no rate limiting, no lockout, and no CAPTCHA.
- **Fix:** Add rate limiting (see Rate Limiting section).

#### AUTH-05 🟡 WARNING — No CSRF protection
- **Impact:** A malicious site could submit forms to the admin API on behalf of an authenticated admin.
- **Fix:** Implement CSRF tokens or rely on SameSite cookie policies once session-based auth is added.

#### AUTH-06 🟡 WARNING — `next-auth` installed but never configured
- **File:** `package.json` — `"next-auth": "^4.24.11"` is a dependency but no configuration, `[...nextauth]` route, or session usage found.
- **Impact:** Dead dependency adds to bundle size and could be a false sense of security.
- **Fix:** Either remove it or implement proper NextAuth-based authentication.

---

### 4. Database Security — Score: 6/10

#### DB-01 🟡 WARNING — SQLite with no encryption at rest
- **File:** `prisma/schema.prisma` (provider: sqlite)
- **Impact:** The database file (`db/custom.db`) is stored unencrypted on disk. Anyone with filesystem access can read all data including customer PII (names, emails, addresses, phone numbers).
- **Fix:** For a production e-commerce app, migrate to PostgreSQL with TLS encryption. For SQLite, consider SQLCipher or filesystem-level encryption.

#### DB-02 🟡 WARNING — No migration system
- **Impact:** `prisma db push` is used (no `prisma/migrations/` directory). Schema changes are applied directly without versioned migration history, making rollback impossible and schema drift between environments likely.
- **Fix:** Switch to `prisma migrate dev` for version-controlled migrations.

#### DB-03 🟡 WARNING — No database backup strategy
- **Impact:** If the SQLite file is corrupted, deleted, or overwritten (e.g., via the unprotected `/api/admin/seed` endpoint), all data is permanently lost.
- **Fix:** Implement automated SQLite backups (e.g., nightly `.backup` of `custom.db`).

#### DB-04 🟡 WARNING — Missing database indexes
- **File:** `prisma/schema.prisma`
- **Impact:** No `@@index` directives defined. Queries on `slug`, `status`, `createdAt`, `order`, `customerEmail`, `orderNumber` etc. will do full table scans as the dataset grows.
- **Fix:** Add `@@index([slug])`, `@@index([status, createdAt])`, `@@index([orderNumber])`, etc.

#### DB-05 🟢 INFO — Prisma ORM prevents SQL injection
- **Status:** All queries use Prisma's parameterized query builder. No raw SQL found.

#### DB-06 🟢 INFO — Connection string from environment variable
- **File:** `prisma/schema.prisma` — `url = env("DATABASE_URL")`
- **Status:** Correct pattern. Connection string is loaded from env, not hardcoded.

---

### 5. Firebase — N/A

Not used in this project.

---

### 6. Supabase — N/A

Not used in this project.

---

### 7. Security Headers — Score: 2/10

#### HDR-01 🔴 CRITICAL — No `middleware.ts` exists
- **Impact:** There is no centralized place to set security headers on every response. The project has no middleware file at all.
- **Fix:** Create `middleware.ts` in the project root to set at minimum: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`.

#### HDR-02 🔴 CRITICAL — No security headers configured in `next.config.ts`
- **File:** `next.config.ts`
- **Impact:** The config only sets `output: "standalone"` and TypeScript settings. No `headers()` function, no CSP, no HSTS.
- **Fix:** Add a `headers()` function in `next.config.ts` or create `middleware.ts`.

#### HDR-03 🔴 CRITICAL — No Content-Security-Policy (CSP)
- **Impact:** No CSP header means the browser will execute any injected script, enabling XSS attacks if an attacker can inject content.
- **Fix:** Add a strict CSP via middleware. Start with `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; object-src 'none'; frame-ancestors 'self'`.

#### HDR-04 🟡 WARNING — No HSTS (HTTP Strict Transport Security)
- **Impact:** Users accessing via HTTP won't be automatically upgraded to HTTPS.
- **Fix:** Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.

#### HDR-05 🟡 WARNING — No X-Frame-Options header
- **Impact:** The site can be embedded in iframes on other domains (clickjacking risk).
- **Fix:** Add `X-Frame-Options: DENY`.

#### HDR-06 🟢 INFO — No `ignoreBuildErrors` concern for security
- **Note:** `ignoreBuildErrors: true` in `next.config.ts` is a development risk, not directly security-related, but it could mask type errors that lead to runtime vulnerabilities.

---

### 8. Rate Limiting — Score: 1/10

#### RL-01 🔴 CRITICAL — No rate limiting on any endpoint
- **Files:** All 13 API route files
- **Impact:** An attacker can:
  - Brute-force the admin password at unlimited speed
  - Scrape the entire product catalog
  - Spam the order creation endpoint
  - Trigger the database wipe seed endpoint repeatedly
  - Exhaust server resources (DoS)
- **Fix:** Install `@upstash/ratelimit` or use an in-memory rate limiter. At minimum, protect the auth endpoint with 5 requests per 15 minutes.

#### RL-02 🔴 CRITICAL — No rate limiting on auth endpoint
- **File:** `src/app/api/admin/auth/route.ts`
- **Impact:** Password can be brute-forced with unlimited attempts.
- **Fix:** Add rate limiting specifically for `POST /api/admin/auth`.

#### RL-03 🔴 CRITICAL — No bot protection
- **Impact:** No CAPTCHA, Turnstile, or bot detection on any endpoint.
- **Fix:** Add Cloudflare Turnstile or similar after N failed auth attempts.

#### RL-04 🟡 WARNING — No request size limits configured
- **Impact:** An attacker could send extremely large JSON payloads to exhaust server memory.
- **Fix:** Configure `serverActions.bodySizeLimit` in `next.config.ts` and validate payload sizes in API routes.

#### RL-05 🟢 INFO — No rate limiting library installed
- **Note:** Neither `@upstash/ratelimit`, `express-rate-limit`, nor `rate-limiter-flexible` is in `package.json`.
- **Fix:** Install a rate limiting library before deployment.

---

### 9. Dependencies — Score: 7/10

#### DEP-01 🟢 INFO — Modern dependency versions
- `next@^16.1.1`, `react@^19.0.0`, `prisma@^6.11.1`, `zod@^4.0.2`
- **Status:** All primary dependencies are recent versions.

#### DEP-02 🟡 WARNING — `next-auth` v4 installed but unused
- **File:** `package.json`
- **Impact:** Adds bundle size unnecessarily. v4 is also approaching end-of-life as Auth.js v5 is the current version.
- **Fix:** Remove `next-auth` from dependencies or upgrade to `next-auth@beta` and actually use it.

#### DEP-03 🟡 WARNING — `ignoreBuildErrors: true` hides type errors
- **File:** `next.config.ts:7`
- **Impact:** TypeScript errors during build are silently ignored, which could mask security-relevant type mismatches.
- **Fix:** Set `ignoreBuildErrors: false` and fix any type errors.

#### DEP-04 🟢 INFO — Zod is installed and available
- **Status:** `zod@^4.0.2` is a dependency but not used in API routes. Ready to be adopted.

---

### 10. File Uploads — N/A

No file upload endpoints found in the API routes. The product images appear to be stored as URL strings, not uploaded files.

---

### 11. Error Handling — Score: 4/10

#### ERR-01 🔴 CRITICAL — No `app/error.tsx` exists
- **Impact:** React errors in route segments will show the default Next.js error page, which reveals the framework and version.
- **Fix:** Create `app/error.tsx` with a generic "Something went wrong" UI.

#### ERR-02 🔴 CRITICAL — No `app/global-error.tsx` exists
- **Impact:** Errors in the root layout have no boundary, potentially crashing the entire app with a raw error display.
- **Fix:** Create `app/global-error.tsx`.

#### ERR-03 🔴 CRITICAL — No `app/not-found.tsx` exists
- **Impact:** Default 404 page reveals the Next.js framework and version to attackers.
- **Fix:** Create `app/not-found.tsx` with a custom 404 page.

#### ERR-04 🟡 WARNING — 29 `console.error()` calls in API routes
- **Files:** All files under `src/app/api/`
- **Impact:** While `console.error` is acceptable for server-side logging, the sheer volume (29 calls) suggests a pattern of logging potentially sensitive information. In production, these logs could leak request details.
- **Fix:** Implement structured logging with sanitization. Avoid logging full error objects in production.

#### ERR-05 🟡 WARNING — No error monitoring (Sentry/Bugsnag/etc.)
- **Impact:** Errors in production go undetected. An attacker can probe for vulnerabilities without triggering any alerts.
- **Fix:** Install `@sentry/nextjs` and configure it.

#### ERR-06 🟢 INFO — Generic error messages returned to clients
- **Status:** The `errorResponse()` helper returns generic messages like "Failed to fetch products" without exposing internal details. This is correct behavior.

---

### 12. CORS — Score: 2/10

#### CORS-01 🔴 CRITICAL — No CORS configuration anywhere
- **Impact:** All API routes accept requests from any origin by default. A malicious website can make authenticated (once auth is added) API requests to the admin endpoints on behalf of a visiting admin user.
- **Fix:** Create `middleware.ts` that restricts `Access-Control-Allow-Origin` to your actual domain(s). For the admin API, consider restricting to same-origin only.

#### CORS-02 🟡 WARNING — No preflight (OPTIONS) handling
- **Impact:** Without CORS middleware, browsers may reject legitimate cross-origin requests or pass through without proper preflight responses.
- **Fix:** Handle OPTIONS requests in middleware with appropriate `Allow-Methods` and `Allow-Headers`.

#### CORS-03 🟢 INFO — No wildcard `Access-Control-Allow-Origin: *` explicitly set
- **Status:** There's no explicit CORS header, but the default behavior is effectively allow-all.

---

## Fix Action Plan

### Priority 1 — CRITICAL (Fix before ANY production deployment)

| Step | Action | Estimated Time |
|------|--------|:--------------:|
| 1.1 | **Add authentication middleware** for all `/api/admin/*` routes. Create a JWT or session-based auth guard that checks for a valid token/cookie. | 2-4 hours |
| 1.2 | **Replace hardcoded password fallback.** Set `ADMIN_PASSWORD` in `.env` and fail if unset. | 15 min |
| 1.3 | **Hash the admin password** with `bcryptjs` instead of plaintext comparison. | 30 min |
| 1.4 | **Create `middleware.ts`** with security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). | 1-2 hours |
| 1.5 | **Add rate limiting** on `/api/admin/auth` (5 req/15 min) and all other API endpoints (100 req/min). Install `@upstash/ratelimit` or implement in-memory limiter. | 1-2 hours |
| 1.6 | **Create error boundaries:** `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`. | 30 min |
| 1.7 | **Remove `.env` from git history:** `git rm --cached .env && git filter-repo --invert-paths --path .env` | 30 min |
| 1.8 | **Disable the seed endpoint** or protect it with admin auth. Remove or gate `POST /api/admin/seed`. | 15 min |
| 1.9 | **Configure CORS** in middleware to restrict origins. | 30 min |

### Priority 2 — HIGH (Fix before going live)

| Step | Action | Estimated Time |
|------|--------|:--------------:|
| 2.1 | **Add Zod validation schemas** for all API route inputs (products, orders, categories, collections, testimonials). | 2-3 hours |
| 2.2 | **Create `.env.example`** with all required variables documented. | 15 min |
| 2.3 | **Set `ignoreBuildErrors: false`** and fix any TypeScript errors. | 1-2 hours |
| 2.4 | **Add database indexes** in `schema.prisma` for frequently queried fields. | 30 min |
| 2.5 | **Switch to `prisma migrate dev`** for versioned migrations. | 30 min |
| 2.6 | **Set up error monitoring** (Sentry). | 1 hour |
| 2.7 | **Remove unused `next-auth` dependency** or implement proper auth with it. | 1-2 hours |
| 2.8 | **Implement database backup strategy** (SQLite file backup). | 30 min |

### Priority 3 — MEDIUM (Fix within first sprint)

| Step | Action | Estimated Time |
|------|--------|:--------------:|
| 3.1 | **Reduce console.error usage** in production. Implement structured logging with environment-aware verbosity. | 1 hour |
| 3.2 | **Add request body size limits** in API routes. | 30 min |
| 3.3 | **Add CAPTCHA/bot protection** on auth endpoint (Cloudflare Turnstile). | 1 hour |
| 3.4 | **Migrate from SQLite to PostgreSQL** for encryption at rest and better production readiness. | 2-4 hours |

### Priority 4 — LOW (Address as part of ongoing security hardening)

| Step | Action | Estimated Time |
|------|--------|:--------------:|
| 4.1 | Add CSRF protection for state-changing requests. | 1 hour |
| 4.2 | Audit `dangerouslySetInnerHTML` usage in chart component. | 30 min |
| 4.3 | Set up secret manager (Doppler, AWS SSM) for production env vars. | 1-2 hours |
| 4.4 | Add HSTS preload submission once HTTPS is confirmed. | 15 min |

---

## Verification Checklist

After applying fixes, verify with these commands:

```bash
# 1. Confirm .env is not tracked
git ls-files .env                          # Should return nothing

# 2. Confirm no hardcoded secrets
rg "bhq2026" src/                         # Should return nothing
rg "ADMIN_PASSWORD.*||" src/               # Should return nothing

# 3. Confirm auth middleware exists
rg "middleware" src/middleware.ts           # Should show auth checks

# 4. Confirm security headers in middleware
rg "Strict-Transport-Security" src/middleware.ts
rg "Content-Security-Policy" src/middleware.ts
rg "X-Frame-Options" src/middleware.ts

# 5. Confirm rate limiting installed
rg "@upstash/ratelimit" package.json

# 6. Confirm error boundaries exist
ls src/app/error.tsx src/app/global-error.tsx src/app/not-found.tsx

# 7. Confirm Zod validation in API routes
rg "z\." src/app/api/admin/products/route.ts

# 8. Build and verify
npm run build
```

---

## Summary of Critical Path

The application cannot be safely deployed as-is. The **minimum viable security baseline** requires:

1. ✅ Authentication on all `/api/admin/*` routes
2. ✅ Strong password management (no hardcoded fallback, hashed comparison)
3. ✅ Security headers via middleware
4. ✅ Rate limiting on auth endpoint
5. ✅ `.env` removed from git history
6. ✅ Custom error pages (error.tsx, global-error.tsx, not-found.tsx)
7. ✅ CORS origin restriction

**Estimated total remediation time:** 8-14 hours of focused development work.
