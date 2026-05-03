# Project Architecture & Tech Stack Guidelines

This document outlines the full-stack architecture for the Gym Tracker with 3D Visualization project. This structure must be followed when generating code, creating new files, or refactoring existing ones to ensure consistency, scalability, and adherence to Software Engineering best practices for the SBD course task.

## 1. High-Level Overview

The application follows a standard Client-Server architecture with a decoupled Frontend and Backend, communicating via a RESTful API.

*   **Frontend:** Next.js (React framework) for Server-Side Rendering (SSR), static generation, and client-side interactivity.
*   **Backend:** Express.js (Node.js framework) for a robust REST API, handling business logic and database interactions.
*   **Database:** PostgreSQL (Relational Database) to handle complex relationships between exercises, muscle groups, and user logs.

## 2. Frontend Architecture (Next.js)

The frontend focuses on User Interface, User Experience, and the implementation of the 3D anatomical visualizer.

### Key Technologies:
*   **Framework:** Next.js (using the App Router for modern React features).
*   **Styling:** Tailwind CSS for utility-first, responsive design.
*   **3D Rendering:** Three.js. It is highly recommended to use **react-three-fiber** (R3F) and **@react-three/drei** to integrate Three.js declaratively within React components.
*   **State Management:** React Context API or Zustand for lightweight client-side state.
*   **Data Fetching:** TanStack Query (React Query) for caching, synchronization, and handling server state.

### Recommended Directory Structure:
```text
/frontend
├── src
│   ├── app            # App Router (Pages and Layouts)
│   ├── components     # Reusable UI components
│   │   ├── engine     # Progression engine specific sub-components
│   │   ├── profile    # Profile and metrics specific sub-components
│   │   ├── ui         # Atomic design components (buttons, inputs)
│   │   └── visualizer # Three.js/R3F components (The Mannequin, Scene)
│   ├── hooks          # Custom React hooks (e.g., useWorkouts, use3DModel)
│   ├── services       # API service layer (Axios instances, fetch calls)
│   ├── store          # Client-side state management
│   ├── types          # TypeScript interfaces
│   └── utils          # Helper functions and constants
├── public
│   └── models         # GLTF/GLB modular anatomy model file
```
## 3. Backend Architecture (Express.js)

The backend must follow a rigid layered architecture (MVC-like pattern without Views, as it serves JSON) to separate concerns and ensure maintainability.

### Key Technologies:
*   **Runtime:** Node.js.
*   **Framework:** Express.js.
*   **Database Interaction:** Raw SQL driver (`pg`) is preferred over a heavy ORM to demonstrate strong SQL skills.
*   **Validation:** Zod or Joi for request body validation.

### Core Architectural Layers:

*   **A. Routes Layer (`/routes`)**
    *   Defines HTTP endpoints (e.g., `GET /api/exercises`).
    *   Responsible for mapping URLs to specific controller functions.
    *   Applies route-specific middleware (auth, validation).

*   **B. Controllers Layer (`/controllers`)**
    *   Handles HTTP request logic.
    *   Extracts parameters (query params, body, headers).
    *   Calls the appropriate Service or Model layer function.
    *   Sends the HTTP response (JSON data and appropriate status codes).

*   **C. Models Layer (`/models`)**
    *   Interacts directly with the PostgreSQL database.
    *   Contains SQL queries (Raw or Query Builder).
    *   Defines data schemas for database inputs/outputs.
    *   *Self-Correction for SBD:* If utilizing Knex.js, migrations and seeds will reside here or in a separate root directory.

*   **D. Middleware Layer (`/middleware`)**
    *   Functions that execute between request and response.
    *   Used for Authentication, Error Handling, and Request Validation.

### Recommended Directory Structure:
```text
/backend
├── src
│   ├── config         # Database connection, environment variables
│   ├── controllers    # Request handling logic
│   ├── db
│   │   ├── migrations # SQL scripts for creating/altering tables
│   │   └── seeds      # Initial data insertion (using muscle.json/exercise.json)
│   ├── middleware     # Custom Express middleware (auth, errors)
│   ├── models         # Database interaction logic (queries)
│   ├── routes         # API endpoint definitions
│   ├── utils          # Helper functions (response formatters, loggers)
│   └── app.js         # Express app setup and middleware registration
├── server.js          # Entry point to start the Node server
```