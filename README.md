# DevScore 🚀

**Standardized Developer Intelligence Platform**

DevScore is an AI-powered system that analyzes GitHub contributions to generate standardized engineering tiers. It evaluates code quality, consistency, and architectural patterns to provide actionable insights for professional growth.

---

## 🔥 Features

- **GitHub OAuth**: Instant authentication and repository sync.
- **Deep Audit**: AI-driven architectural analysis using Groq + Llama 3.3.
- **Scoring Pipeline**: Automated grading across Depth, Discipline, and Consistency.
- **GitProof Badges**: Dynamically generated, shareable profile widgets.
- **Industrial UI**: Premium dark/light themes built with React and Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts.
- **Backend**: Django 5, REST Framework, PostgreSQL.
- **Async Logic**: Django Background Tasks.
- **AI Engine**: Groq (Llama 3.3 70B).
- **Infrastructure**: Docker Compose, Koyeb (Backend), Vercel (Frontend).

## ⚡ Quick Start

### 1. Configure Environment

Clone the repository and set up your `.env` file:

```bash
cp .env.example .env
```

Update the `.env` with your **GitHub OAuth** and **Groq API** keys.

### 2. Launch with Docker

Spin up the database, cache, and backend services:

```bash
docker compose up --build -d
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Default Access

- **Admin Panel**: `http://localhost:8000/admin`
- **Username**: `jithin`
- **Password**: `admin`

## 🌍 Deployment

- **Frontend**: Deployed on **Vercel**.
- **Backend**: Deployed on **Koyeb** (Free Tier).
- **Database**: Managed **Neon PostgreSQL**.

---

## 📄 License

Licensed under the [MIT License](LICENSE).

---
*Created for the high-performance developer.*
