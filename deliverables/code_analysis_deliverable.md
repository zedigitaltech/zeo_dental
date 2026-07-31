# Penetration Test Scope & Boundaries

**Primary Directive:** Your analysis is strictly limited to the **network-accessible attack surface** of the application. All subsequent tasks must adhere to this scope. Before reporting any finding (e.g., an entry point, a vulnerability sink), you must first verify it meets the "In-Scope" criteria.

### In-Scope: Network-Reachable Components

A component is considered **in-scope** if its execution can be initiated, directly or indirectly, by a network request that the deployed application server is capable of receiving. This includes:

- Publicly exposed web pages and API endpoints.
- Endpoints requiring authentication via the application's standard login mechanisms.
- Any developer utility, debug console, or script that has been mistakenly exposed through a route or is otherwise callable from other in-scope, network-reachable code.

### Out-of-Scope: Locally Executable Only

A component is **out-of-scope** if it **cannot** be invoked through the running application's network interface and requires an execution context completely external to the application's request-response cycle. This includes tools that must be run via:

- A command-line interface (e.g., `go run ./cmd/...`, `python scripts/...`).
- A development environment's internal tooling (e.g., a "run script" button in an IDE).
- CI/CD pipeline scripts or build tools (e.g., Dagger build definitions).
- Database migration scripts, backup tools, or maintenance utilities.
- Local development servers, test harnesses, or debugging utilities.
- Static files or scripts that require manual opening in a browser (not served by the application).

---

## 1. Executive Summary

This is a **dental clinic management system** built with React and Fastify, featuring an AI-powered chatbot, booking management, and integrated CRM. The application handles sensitive patient data (PHI) but has several significant security gaps that require immediate attention.

The security posture can be characterized as implementing a **minimal viable security model** suitable for a low-risk internal tool, but with critical vulnerabilities that must be addressed before handling production patient data at scale. The authentication mechanism relies on a single shared static token with no password hashing, which represents the most significant architectural vulnerability. While the application implements robust security headers, CORS protection, and rate limiting, the core authentication architecture should be strengthened.

**Key Findings Summary:**

- **CRITICAL:** Plaintext password comparison with no hashing (CWE-916)
- **CRITICAL:** No encryption at rest for PHI data (HIPAA violation)
- **HIGH:** Static bearer token vulnerable to XSS via sessionStorage
- **HIGH:** SSL certificate validation disabled in production database connections
- **MEDIUM:** SSRF vulnerability via IP-based geolocation endpoint
- **LOW:** No XSS/Injection sinks found - parameterized queries throughout

**Overall Risk Rating:** MEDIUM-HIGH - The system is NOT HIPAA compliant in its current state and should not be used for production PHI processing until critical vulnerabilities are remediated.

---

## 2. Architecture & Technology Stack

### Framework & Language

**Primary Technology Stack:**

- **Frontend**: React 19.2.1 with TypeScript 5.8.2
  - Build Tool: Vite 6.2.0
  - Styling: Tailwind CSS 4.1.18 + Framer Motion 12.23.25
  - Icons: Lucide React 0.556.0
  - Location: `/target-repo/App.tsx`, `/target-repo/index.tsx`, `/target-repo/components/`

- **Backend**: Node.js with Fastify 4.28.1 framework
  - Language: TypeScript 5.5.3
  - Location: `/target-repo/server/src/index.ts`
  - Server: Fastify with Helmet, CORS, Rate Limiting
  - Port: 3000 (configurable via PORT env var)

- **Database**: PostgreSQL (Production) / MariaDB (CRM)
  - Connection: Via `pg` library (PostgreSQL client)
  - Location: `/target-repo/server/src/plugins/postgres.ts`
  - ORM: Raw SQL queries (no ORM used)

### Architectural Pattern

**Pattern**: **Monolithic Full-Stack Application with Integrated CRM**

**Architecture Components:**

1. **Frontend SPA** (Single Page Application)
   - Client-side routing using custom `useRoute` hook
   - Component-based React architecture
   - Location: `/target-repo/components/`

2. **Backend API Server**
   - Fastify-based REST API
   - Route modules: chat, booking, receptionist
   - Location: `/target-repo/server/src/routes/`

3. **Integrated CRM System**
   - OpenEMR-based dental CRM (crm-ze)
   - Custom modules for guided tours
   - Location: `/target-repo/crm-ze/`

4. **External Services Integration**
   - Google Gemini AI (chatbot)
   - PostgreSQL database
   - Resend (email service)
   - WhatsApp API (notifications)

**Deployment Architecture:**

- **Primary Platform**: Fly.io (cloud deployment)
- **Containerization**: Docker multi-stage builds
- **Files**: `/target-repo/Dockerfile`, `/target-repo/fly.toml`, `/target-repo/docker-compose.yml`

### Critical Security Components

**Rate Limiting & Security Headers:**

- Global rate limiting: 200 req/min per IP with admin bypass
- Helmet.js configured with CSP, CORS, security headers
- IP-based tracking via `fly-client-ip` or `x-forwarded-for`
- File: `/target-repo/server/src/index.ts` (lines 61-74)

**Database Connection Pool:**

- Max 20 connections, 30s idle timeout
- SSL disabled certificate validation in production (`rejectUnauthorized: false`)
- File: `/target-repo/server/src/plugins/postgres.ts`

---

## 3. Authentication & Authorization Deep Dive

### Authentication Mechanisms

#### 1. Admin/Receptionist Authentication

**Type**: Bearer Token Authentication (Static)

**Implementation Details:**

- **File**: `/target-repo/server/src/routes/receptionist.ts` (lines 18-27)
- **Token Storage**: Environment variable `ADMIN_TOKEN`
- **Implementation**:
  ```typescript
  const authPreHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!adminToken) {
      return reply.status(503).send({ success: false, error: 'Admin access not configured' });
    }
    const authHeader = request.headers.authorization;
    if (authHeader !== `Bearer ${adminToken}`) {
      return reply.status(401).send({ success: false, error: 'Unauthorized' });
    }
  };
  ```

**API Endpoints for Authentication:**
| Method | Route | Authentication | Description |
|--------|-------|----------------|-------------|
| POST | `/api/receptionist/login` | No | Admin login endpoint - returns bearer token on success |

**Login Flow Implementation:**

- **File**: `/target-repo/server/src/routes/receptionist.ts` (lines 29-55)
- **Client-Side**: `/target-repo/components/receptionist/ReceptionistLogin.tsx`
- **Security Issue**: Password compared directly to `ADMIN_TOKEN` environment variable with NO HASHING
  ```typescript
  if (password === adminToken) {
    return reply.send({
      success: true,
      message: 'Login successful',
      token: adminToken,
    });
  }
  ```

#### 2. Session Management

**Token Storage (Client-Side):**

- **File**: `/target-repo/components/receptionist/ReceptionistApp.tsx` (lines 55-57, 110-118)
- **Storage**: `sessionStorage` (cleared when browser closes)
- **Security Issues**:
  - No HttpOnly flag protection (vulnerable to XSS)
  - No Secure flag (transmitted over HTTP if not HTTPS)
  - No SameSite cookie attribute (mitigated by sessionStorage scope)
  - Token is the same static value for all sessions

**Session Cookie Flags: NOT APPLICABLE**
The application does NOT use cookies for session management. It uses sessionStorage which does not support HttpOnly, Secure, or SameSite flags. This is a security limitation as the token is accessible via JavaScript and vulnerable to XSS attacks.

#### 3. Authorization Model

**Role-Based Access Control (RBAC): NOT IMPLEMENTED**

- Single admin role only
- No user roles or permission levels
- No distinction between receptionist, admin, or super-admin
- All authenticated users have full access to all features

**Access Control Middleware:**

- Implemented via Fastify pre-handler functions
- Consistent authorization checks across protected routes
- Early return pattern prevents unauthorized access to handlers
- File: `/target-repo/server/src/routes/booking.ts` (lines 191-224)

#### 4. SSO/OAuth/OIDC Flows

**Status: NOT IMPLEMENTED for main application**

The main application does not implement SSO/OAuth/OIDC for admin authentication. However, the CRM integration uses OAuth2:

**CRM OAuth2 Integration:**

- **File**: `/target-repo/server/src/services/crmSync.ts` (lines 103-137)
- **Flow**: Password grant type (not recommended for production)
- **Token URL**: `${CRM_BASE_URL}/oauth2/${siteId}/token`
- **Validation**: No `state` or `nonce` parameters (not applicable to password grant)

---

## 4. Data Security & Storage

### Database Security

**PostgreSQL Configuration:**

- **File**: `/target-repo/server/src/plugins/postgres.ts`
- **SSL Mode**: Certificate validation DISABLED in production
  ```typescript
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  ```
- **Risk**: MITM attacks possible on database connections

**Database Schema:**

1. **Bookings Table** (`/target-repo/server/migrations/001_bookings.sql`):
   - Fields: id (UUID), name, email, phone, service, preferred_date, preferred_time, status, notes, created_at, updated_at
   - **CRITICAL**: PHI fields (description, notes) stored in PLAIN TEXT
   - Indexes: email, date, status, created_at

2. **Chat Usage Table** (`/target-repo/server/migrations/003_chat_usage.sql`):
   - Fields: id, input_tokens, output_tokens, total_tokens, estimated_cost, language, created_at
   - Purpose: Track AI chatbot usage and costs

### Data Flow Security

**Sensitive Data Flows:**

1. **Booking Form Entry** → Validation → PostgreSQL (plain text)
2. **Patient Data** → CRM Sync → OpenEMR (OAuth2 + REST)
3. **Chat Messages** → Gemini API → Response (rate limited)

**CRITICAL HIPAA Violations:**

- No encryption at rest for PHI fields
- No audit logging of PHI access
- No data integrity verification
- SSL certificate validation disabled

### Multi-tenant Data Isolation

**Status: NOT IMPLEMENTED**

- Single-tenant application
- No tenant separation required for current use case

---

## 5. Attack Surface Analysis

### External Entry Points (Network-Accessible)

**REST API Endpoints:**
| Method | Route | Authentication | Description |
|--------|-------|----------------|-------------|
| POST | `/api/chat` | No (Rate limited: 15 req/min) | AI chatbot endpoint |
| POST | `/api/booking` | No | Create new booking |
| GET | `/api/bookings` | YES - Bearer token | List all bookings (admin) |
| POST | `/api/receptionist/login` | No | Admin login |
| GET | `/api/receptionist/stats` | YES - Bearer token | Dashboard statistics |
| GET | `/api/receptionist/chat-stats` | YES - Bearer token | Chat usage statistics |
| GET | `/api/receptionist/bookings` | YES - Bearer token | List bookings with filters |
| GET | `/api/receptionist/bookings/:id` | YES - Bearer token | Get single booking |
| PATCH | `/api/receptionist/bookings/:id/confirm` | YES - Bearer token | Confirm booking |
| PATCH | `/api/receptionist/bookings/:id/cancel` | YES - Bearer token | Cancel booking |
| PATCH | `/api/receptionist/bookings/:id/status` | YES - Bearer token | Update booking status |
| GET | `/health` | No | Health check |
| GET | `/api/detect-language` | No | IP-based language detection |

**Client-Side Routes (React Router):**

- `/` - Home page
- `/book` - Booking form
- `/receptionist` - Admin dashboard (client-side auth)
- `/treatments/*` - Treatment pages
- `/privacy-policy`, `/terms-of-service` - Legal pages

### Input Validation Patterns

**Booking Form Validation** (`/target-repo/server/src/routes/booking.ts`):

- Email regex validation
- Phone regex validation (10+ digits)
- Date validation (future dates only)
- Honeypot field for spam detection

**Chat Input Validation** (`/target-repo/server/src/routes/chat.ts`):

- Message length limit: 5000 characters
- Language whitelist validation (8 languages)

### Out-of-Scope Components

The following components are **NOT network-accessible** and are excluded from scope:

- Database migration scripts (`/target-repo/server/migrations/`)
- Build scripts (`/target-repo/scripts/`)
- Docker compose for local development
- CRM database initialization scripts

---

## 6. Infrastructure & Operational Security

### Secrets Management

**Environment Variables** (`/target-repo/server/.env.example`):

- `GEMINI_API_KEY` - Google AI API key
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_TOKEN` - Static bearer token (CRITICAL: plain text)
- `RESEND_API_KEY` - Email API key
- `CRM_*` - CRM integration credentials

**Security Issues:**

- Default/example credentials in `.env.example`
- API keys bundled in frontend build (`/target-repo/vite.config.ts` lines 15-16)
- No secret rotation mechanism

### Configuration Security

**Security Headers (Helmet.js)** (`/target-repo/server/src/index.ts` lines 35-58):

- Content Security Policy configured with `unsafe-inline` for styles
- Cross-origin resource policy
- Referrer policy: strict-origin-when-cross-origin
- **Missing**: HSTS header not explicitly set

**CORS Configuration:**

- Whitelist-based origin validation in production
- Allowed origins: zeodentalclinic.com, www.zeodentalclinic.com, zeo-dental.fly.dev
- Methods restricted to: GET, POST, PATCH, OPTIONS

**Infrastructure Security Headers (Nginx for CRM):**

- File: `/target-repo/crm-ze/deploy/nginx/nginx.conf`
- HSTS enabled: `max-age=31536000; includeSubDomains`
- X-Frame-Options, X-Content-Type-Options, X-XSS-Protection configured

### External Dependencies

**Critical External Services:**

1. **Google Gemini AI** - Chatbot functionality
2. **PostgreSQL** - Primary database
3. **Resend** - Email service
4. **WhatsApp Business API** - Notifications
5. **OpenEMR (CRM)** - Patient management
6. **ip-api.com** - IP geolocation

### Monitoring & Logging

**Logging Implementation:**

- Pino logger with console transport
- Client IP logging for admin access
- **Issue**: No audit logging of PHI access
- **Issue**: Potential for PHI in error logs

---

## 7. Overall Codebase Indexing

The codebase follows a **monolithic full-stack structure** with clear separation between frontend React components and backend Fastify API routes. The project uses TypeScript throughout, providing type safety across the stack.

**Directory Organization:**

- `/target-repo/components/` - React components organized by feature (Booking, ChatWidget, Receptionist, sections)
- `/target-repo/server/src/` - Fastify backend with routes, services, plugins, and types
- `/target-repo/server/migrations/` - PostgreSQL migration files
- `/target-repo/crm-ze/` - OpenEMR-based CRM with custom modules
- `/target-repo/public/` - Static assets and SEO files

**Build & Development:**

- Vite for frontend bundling with hot module replacement
- Docker multi-stage builds for production
- Fly.io deployment configuration
- No formal API documentation or schema files

**Security-Relevant Conventions:**

- Environment variables for all secrets
- Parameterized SQL queries throughout
- Input validation on all endpoints
- Rate limiting on expensive operations
- Security headers via Helmet.js

**Discoverability Impact:**
The flat component structure and consistent naming conventions make security components relatively easy to locate. Authentication logic is centralized in the receptionist routes, and database queries are consistently parameterized. However, the lack of formal API documentation means endpoints must be discovered through code analysis.

---

## 8. Critical File Paths

### Configuration

- `/target-repo/.env.example`
- `/target-repo/server/.env.example`
- `/target-repo/Dockerfile`
- `/target-repo/docker-compose.yml`
- `/target-repo/fly.toml`
- `/target-repo/vite.config.ts`

### Authentication & Authorization

- `/target-repo/server/src/routes/receptionist.ts` (lines 18-55)
- `/target-repo/components/receptionist/ReceptionistLogin.tsx`
- `/target-repo/components/receptionist/ReceptionistApp.tsx` (lines 55-118)

### API & Routing

- `/target-repo/server/src/index.ts` (main server)
- `/target-repo/server/src/routes/chat.ts`
- `/target-repo/server/src/routes/booking.ts`
- `/target-repo/server/src/routes/receptionist.ts`
- `/target-repo/App.tsx` (client-side routing)

### Data Models & DB Interaction

- `/target-repo/server/migrations/001_bookings.sql`
- `/target-repo/server/migrations/003_chat_usage.sql`
- `/target-repo/server/src/plugins/postgres.ts`
- `/target-repo/server/src/types.ts`

### Dependency Manifests

- `/target-repo/package.json`
- `/target-repo/server/package.json`
- `/target-repo/package-lock.json`

### Sensitive Data & Secrets Handling

- `/target-repo/server/src/services/crmSync.ts`
- `/target-repo/server/src/services/emailTemplates.ts`
- `/target-repo/server/src/services/whatsapp.ts`

### Middleware & Input Validation

- `/target-repo/server/src/index.ts` (Helmet, CORS, Rate Limit)
- `/target-repo/utils/sanitize.tsx`

### Logging & Monitoring

- `/target-repo/server/src/index.ts` (Pino logger configuration)

### Infrastructure & Deployment

- `/target-repo/crm-ze/deploy/nginx/nginx.conf`
- `/target-repo/crm-ze/docker-compose.yml`

---

## 9. XSS Sinks and Render Contexts

**STATUS: SECURE - No dangerous XSS sinks found in publicly accessible code.**

The application demonstrates strong XSS protection practices:

### Security Controls Implemented

1. **No Dangerous DOM Sinks:**
   - No `innerHTML`, `outerHTML` assignments found
   - No `document.write()`, `document.writeln()` usage
   - No `insertAdjacentHTML()` or `createContextualFragment()`
   - No jQuery HTML manipulation methods

2. **React Safe Rendering:**
   - Components use safe text rendering via JSX
   - Messages rendered as React children, not HTML strings
   - No `dangerouslySetInnerHTML` usage
   - File: `/target-repo/components/ChatWidget.tsx` (lines 155-169)

3. **Output Encoding:**
   - HTML escaping for email templates via `escapeHtml()` function
   - File: `/target-repo/server/src/services/emailTemplates.ts` (lines 5-12)
   - URL encoding for HTTP requests via `encodeURIComponent()`

4. **SQL Injection Prevention:**
   - 100% use of parameterized queries
   - All database queries use `$1, $2` placeholder syntax
   - File: `/target-repo/server/src/routes/booking.ts` (lines 102-117)

**Risk Assessment:** LOW - No XSS vulnerabilities identified in publicly accessible code.

---

## 10. SSRF Sinks

**STATUS: MEDIUM RISK - 6 SSRF sinks identified in publicly accessible code.**

### Critical SSRF Sinks

#### 1. Geo-IP Lookup with User-Influenced IP (MEDIUM RISK)

**File**: `/target-repo/server/src/index.ts` (lines 139-168)
**Endpoint**: `GET /api/detect-language`

```typescript
let clientIp = (request.headers['fly-client-ip'] ||
  request.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
  request.ip) as string;

const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
const ipv6Regex = /^[0-9a-fA-F:]+$/;
if (!ipv4Regex.test(clientIp) && !ipv6Regex.test(clientIp)) {
  return { language: 'en' };
}

const res = await fetch(
  `http://ip-api.com/json/${encodeURIComponent(clientIp)}?fields=countryCode`,
  {
    signal: AbortSignal.timeout(2000),
  }
);
```

**Vulnerability:** IP addresses from user-controlled `X-Forwarded-For` header. While regex validation exists, it allows private IP ranges (10.x.x.x, 192.168.x.x, 127.x.x.x), enabling potential internal service access.

#### 2. CRM OAuth Token Endpoint (MEDIUM RISK)

**File**: `/target-repo/server/src/services/crmSync.ts` (lines 103-137)

```typescript
const tokenUrl = `${this.config.baseUrl}/oauth2/${this.siteId}/token`;
const res = await fetch(tokenUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: body.toString(),
});
```

**Vulnerability:** URL constructed from environment variable `CRM_BASE_URL`. If compromised, attacker controls entire endpoint.

#### 3. CRM API Requests with Dynamic Paths (MEDIUM RISK)

**File**: `/target-repo/server/src/services/crmSync.ts` (lines 139-171)

```typescript
private async apiRequest(method: string, path: string, body?: Record<string, unknown>): Promise<unknown> {
  const url = `${this.config.baseUrl}/apis/${this.siteId}/api${path}`;
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
}
```

**Called by:**

- `findPatient()` (lines 176-201): Uses user email/phone in URL query params
- `createPatient()` (lines 206-240): User data in POST body
- `createAppointment()` (lines 245-293): User service/date/time in POST body

#### 4. CRM Health Check (LOW RISK)

**File**: `/target-repo/server/src/services/crmSync.ts` (lines 351-361)

```typescript
async healthCheck(): Promise<boolean> {
  const res = await fetch(`${this.config.baseUrl}/apis/${this.siteId}/api/facility`, {
    method: 'HEAD',
    signal: AbortSignal.timeout(5000),
  });
}
```

#### 5. Gemini AI API Call (LOW-MEDIUM RISK)

**File**: `/target-repo/server/src/routes/chat.ts` (lines 375-407)

```typescript
const response = await fetchWithRetry(`${GEMINI_API_URL}?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contents, generationConfig, safetySettings }),
});
```

**Vulnerability:** User message included in request body. Fixed URL but potential for prompt injection.

#### 6. WhatsApp Cloud API (LOW RISK)

**File**: `/target-repo/server/src/services/whatsapp.ts` (lines 55-71)

```typescript
const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messaging_product: 'whatsapp',
    to: formatPhoneForWhatsApp(to),
    type: 'text',
    text: { body: message },
  }),
});
```

**Validation:** Phone sanitization removes non-digits, enforces Albanian country code.

### SSRF Risk Summary Table

| Rank | File                                           | Line | Risk Level     | User Input          | Validation          | Description      |
| ---- | ---------------------------------------------- | ---- | -------------- | ------------------- | ------------------- | ---------------- |
| 1    | `/target-repo/server/src/index.ts`             | 154  | **MEDIUM**     | X-Forwarded-For IP  | IPv4/IPv6 regex     | Geo-IP lookup    |
| 2    | `/target-repo/server/src/services/crmSync.ts`  | 120  | **MEDIUM**     | None (env config)   | N/A                 | CRM OAuth token  |
| 3    | `/target-repo/server/src/services/crmSync.ts`  | 145  | **MEDIUM**     | Patient email/phone | encodeURIComponent  | CRM API queries  |
| 4    | `/target-repo/server/src/services/crmSync.ts`  | 353  | **LOW**        | None (env config)   | N/A                 | CRM health check |
| 5    | `/target-repo/server/src/routes/chat.ts`       | 375  | **LOW-MEDIUM** | Chat message        | Length limit (5000) | Gemini AI API    |
| 6    | `/target-repo/server/src/services/whatsapp.ts` | 55   | **LOW**        | Phone number        | Digit sanitization  | WhatsApp API     |

---

## Summary of Critical Findings

### CRITICAL (Immediate Action Required)

1. **Plaintext Password Storage** - Admin password compared directly to environment variable with no hashing
2. **No Encryption at Rest** - All PHI stored in plain text, HIPAA violation

### HIGH (Address Soon)

3. **Static Bearer Token** - No session isolation, cannot revoke individual sessions
4. **Token in sessionStorage** - Vulnerable to XSS attacks
5. **SSL Validation Disabled** - Production database connections skip certificate verification
6. **API Keys in Frontend Bundle** - Client-side exposure of server secrets

### MEDIUM (Recommendations)

7. **SSRF via Geo-IP** - Internal network access possible via header manipulation
8. **No Audit Logging** - Undetectable PHI breaches
9. **No RBAC** - All admins have full access
10. **No Session Timeout** - Sessions persist indefinitely

---

_Report generated from comprehensive source code analysis_
_Analysis Date: 2026-02-17_
