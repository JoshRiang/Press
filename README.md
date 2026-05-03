# 🏋️ Press: Open Source Gym Logger

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Project Status: Active](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()

**Press** is a high-performance, open-source gym logging platform built for those who value precision, data, and a premium user experience. It features an anatomical-first approach to workout tracking, providing deep insights into muscle engagement and progression.

---

## ✨ Features

- **Anatomical Mapping**: Visualize muscle engagement with integrated 3D/anatomical models.
- **Progression Engine**: Track your lifts with granular detail and rolling performance metrics.
- **Privacy First**: Fully open-source and self-hostable.
- **Developer Centric**: Built with a modern monorepo architecture and AI-optimized documentation.

---

## 🛠️ Tech Stack

Press is built using a modern, scalable stack:

- **Core Architecture**: [TurboRepo](https://turbo.build/) (Monorepo)
- **Frontend**: [Next.js](https://nextjs.org/) + [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Visuals**: [Three.js](https://threejs.org/) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend**: [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) + [Knex.js](https://knexjs.org/)
- **Validation**: [Zod](https://zod.dev/)

---

## 📂 Project Structure

```text
press/
├── apps/
│   ├── frontend/      # Next.js web application
│   └── backend/       # Express API server
├── packages/
│   └── data/          # Shared data definitions and constants
└── docs/              # AI-Optimized Documentation
```

---

## 🤖 AI-Ready Documentation

This project is designed to be highly compatible with AI coding assistants. 

We maintain a dedicated [**`/docs`**](file:///docs) directory containing structured, markdown-based specifications. If you are using an AI assistant to help you build or modify Press, point it to these files for instant context:

- [**Architecture**](file:///docs/architecture.md): High-level system design and flow.
- [**Data Schema**](file:///docs/data-schema.md): Database models and relationships.
- [**Design System**](file:///docs/design.md): UI/UX principles and component patterns.
- [**Security**](file:///docs/security.md): Authentication and authorization protocols.
- [**Environment**](file:///docs/env.md): Required environment variables and configuration.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS)
- PostgreSQL
- npm (v11+)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/press.git
   cd press
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Follow the instructions in [`docs/env.md`](file:///docs/env.md) to set up your `.env` files in both `apps/frontend` and `apps/backend`.

4. **Run in development mode**:
   ```bash
   npm run dev
   ```

---

## 🤝 Contributing

Press is an open-source project. We welcome contributions of all kinds! Please check the issues or submit a pull request.

## 📄 License

This project is licensed under the [ISC License](LICENSE).

### Made With Love By
Joshua Richardo Riangkamang
