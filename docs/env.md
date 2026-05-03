# Environment Variables Configuration Guidelines

This document establishes strict rules for handling configuration, secrets, API endpoints, and database connections using Environment Variables (`.env`). As this project is fully decoupled (separate Frontend and Backend) and deployed online, **hardcoding any configuration string is strictly prohibited.**

## 1. Core Principles

*   **Zero Hardcoding:** No API URLs, database connection strings, ports, or secret keys allowed in source code.
*   **Separation of Concerns:** Keep `.env` files out of version control (`Git`). Only commit `.env.example` files.
*   **Environment Aware:** Code must adapt based on the loaded variables (e.g., connecting to a local DB in development and a production DB in deployment).

---

## 2. Backend (Express.js) Configuration

The backend reads variables using `process.env.VARIABLE_NAME`. Use the `dotenv` package locally. 

### Required Variables (`.env.example`):
```text
# --- Server Setup ---
PORT=5000                   # The port the Express server listens on
NODE_ENV=development        # options: development, production, test

# --- Database Connection (CRITICAL) ---
# Format: postgres://username:password@host:port/database_name
DATABASE_URL=postgres://youruser:yourpassword@localhost:5432/gym_tracker_db

# --- Security & Auth (CRITICAL) ---
JWT_ACCESS_SECRET=super_long_random_string_for_access_token
JWT_REFRESH_SECRET=super_long_random_string_for_refresh_token
JWT_ACCESS_EXPIRATION=15m   # 15 minutes
JWT_REFRESH_EXPIRATION=7d   # 7 days

# --- CORS & Networking ---
# The URL of your deployed Frontend Next.js application
FRONTEND_URL=http://localhost:3000
```

## 3. Frontend (Next.js) Configuration

Next.js handles environment variables differently based on where they are used (Client-side vs. Server-side).

### Required Variables (`.env.example`):
```text
# --- Public (Client-Side accessible) ---
# MUST start with NEXT_PUBLIC_ to be available in React components
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api/v1

# --- Private (Server-Side/Build-time only) ---
# NOT prefixed with NEXT_PUBLIC_. Only accessible in API Routes or getServerSideProps
BACKEND_INTERNAL_API_KEY=secret_key_if_using_server_to_server_calls
```