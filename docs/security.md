# Commercial-Grade Security Architecture Guidelines

This document establishes the mandatory security practices and architecture required to transform this project from an academic assignment into a secure, public, and commercial web application. Adherence to these guidelines is non-negotiable for commercial deployment.

## 1. High-Level Security Principles

The core engineering principles guiding our security decisions:

*   **Defense in Depth:** Multiple layers of security should exist. A failure in one layer must not compromise the entire system.
*   **Principle of Least Privilege:** Every component, user, and service must only have the minimum necessary access rights to function.
*   **Secure by Default:** Security configurations must be on by default.

---

## 2. Authentication & Session Management (The Front Door)

We will use industry standards (OAuth 2.0/OIDC) and best practices for Express.js SPAs. Do not attempt to "roll your own" authentication.

### Key Practices:

1.  **Authentication Method:** Implement JSON Web Tokens (JWTs) using access and refresh tokens. Use an established library like `passport.js` or a battle-tested commercial provider (e.g., Auth0, Clerk, Firebase Auth) if budget allows.
2.  **Secure Token Storage:**
    *   **Frontend:** Do *not* store tokens in `localStorage` or `sessionStorage` (vulnerable to XSS).
    *   **Implementation (Done):** The access token is stored in memory (React state/Zustand) and the refresh token is securely placed in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie via the backend. The backend provides `/auth/refresh` and `/auth/logout` endpoints to manage this lifecycle securely.
3.  **Password Policy:** Enforced via Zod schema (min 12 chars, uppercase, lowercase, numbers, symbols).
4.  **Password Hashing:** Passwords are hashed using **Argon2id** before database insertion.
5.  **Rate Limiting (Backend):** The `express-rate-limit` middleware is actively applied to `/api/v1/auth` to prevent brute-force attacks and DoS against the CPU-intensive Argon2 hashing.
6.  **Multi-Factor Authentication (MFA):** As a commercial application, plan to implement MFA (preferably via Authenticator Apps/TOTP, not SMS) as a required feature for all users in the future.

---

## 3. Application Security & API Defense (OWASP Top 10 focus)

Our Express.js backend must be explicitly hardened against the OWASP Top 10 vulnerabilities.

### Key Practices:

1.  **Strict Input Validation & Sanitization (Model/Controller Layer):**
    *   **Instruction:** Trust nothing from the client. Validate *all* incoming data (`req.body`, `req.params`, `req.query`).
    *   **Technology:** Use a robust validation library like **Zod** (highly recommended for TypeScript synergy) or **Joi**. Apply schemas *before* the business logic. Sanitization (e.g., stripping dangerous HTML) must follow validation.
2.  **SQL Injection Prevention (Model Layer):**
    *   **Instruction:** *Never* concatenate user-provided strings directly into raw SQL queries.
    *   **Implementation:** Always use **Prepared Statements / Parameterized Queries**. Our chosen tools (Knex.js or the `pg` driver) handle this by default *unless* you use raw queries carelessly.
3.  **Secure HTTP Headers (Backend Layer):**
    *   **Implementation:** Use the **Helmet.js** middleware in Express. It sets secure headers (like Content Security Policy (CSP), X-Frame-Options, X-XSS-Protection) by default.
    *   **CSP (Content Security Policy):** Configure a strict CSP (via Helmet) to only allow scripts and assets from trusted origins, mitigating XSS attacks.
4.  **CORS (Cross-Origin Resource Sharing):**
    *   **Implementation (Done):** The `cors` middleware is strictly configured to only accept requests from `process.env.FRONTEND_URL` (or `http://localhost:3000` as fallback), preventing unauthorized cross-origin requests.
5.  **Role-Based Access Control (RBAC):**
    *   **Implementation:** Create standard middleware (`checkRole(['admin', 'member'])`) applied after authentication to verify the user has the required permissions to access the resource, preventing insecure direct object reference (IDOR).
6.  **Error Handling (Backend Utils):**
    *   **Instruction:** *Never* expose stack traces, database schema details, or sensitive server info in the JSON response to the client. Logs must contain details for debugging, but user responses should be generic (e.g., "An unexpected error occurred").

---

## 4. Data Protection & Privacy

Data must be protected in transit and at rest.

### Key Practices:

1.  **Encryption in Transit (Frontend/Backend Deployment):**
    *   **Mandatory:** **HTTPS (TLS 1.3 or 1.2 minimum)** must be enforced for the frontend and all API endpoints. Use a valid certificate from a trusted authority (e.g., Let's Encrypt).
2.  **Encryption at Rest (Database Layer):**
    *   **Instruction:** Commercial databases should utilize Full Disk Encryption (FDE). When using cloud providers (like AWS RDS, Google Cloud SQL, Supabase), ensure **Storage Encryption** is enabled by default.
    *   **Column-Level Encryption:** If storing highly sensitive personal data (e.g., real names, specific health metrics linked to identity), encrypt those specific columns in PostgreSQL using **pgcrypto**.
3.  **Audit Logs (Database Context):**
    *   **Requirement:** For a commercial gym tracker, create a tamper-evident audit log table. Log *who* changed *what* and *when* for critical operations (changing logs, user profile updates, access right changes). Triggers can automate this in PostgreSQL.

---

## 5. Infrastructure & Secrets Management

Security is not just code; it's also environmental.

### Key Practices:

1.  **Secret Management (CRITICAL):**
    *   **Instruction:** **Never, under any circumstances, commit database passwords, API keys (like JWT secrets, Stripe keys), or encryption keys into Git or source code.**
    *   **Implementation:** Use **Environment Variables** (`.env` files) *locally only* (add `.env` to `.gitignore`). In **production**, use the secret management tools provided by your host (e.g., AWS Secrets Manager, Google Secrets Manager, or the dashboard secrets management of Vercel/Render/Fly.io).
2.  **Database Account Privilege (SBD Context):**
    *   **Instruction:** The application backend must connect to PostgreSQL using a dedicated database user (e.g., `gym_tracker_app`), *not* the `postgres` superuser. This dedicated user should *only* have CRUD (Select, Insert, Update, Delete) permissions on the necessary tables, not DDL (Create Table, Drop Table) permissions outside of migrations.
3.  **Deployment Pipeline (CI/CD):**
    *   **Practice:** Integrate automated security scanning tools (like `npm audit`, Snyk, or GitHub's Dependabot) into the CI/CD pipeline to flag vulnerable dependencies in real-time.
4.  **Network Isolation:** Ensure the PostgreSQL database is not publicly accessible via the internet. Use Private VPC networking or restrictive firewalls that only accept connections from the backend server's IP.

---

## 6. Claude Interaction Guidelines for Security

When instructing Claude (AI) to generate code for this commercial project, you must explicitly remind it of this security layer.

### Example Prompt Pattern for Secured Code Generation:

> "Claude, generate the **Controller** and **Model** for `POST /api/workout-logs`.
>
> We are using Express.js and Knex.js for PostgreSQL. **Follow the `security.md` guidelines:**
> 1.  Validate the `req.body` rigorously using **Zod** schema (must include user_id, exercise_id, reps, weight).
> 2.  Ensure the Knex.js query is parameterized to **prevent SQL injection**.
> 3.  Implement business logic that **validates the user_id** against the currently authenticated user (from the HttpOnly JWT) **to prevent IDOR**.
> 4.  Do not write the route yet, just the controller and model functions."