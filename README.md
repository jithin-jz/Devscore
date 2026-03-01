<h1 align="center">DevScore / GitProof 🚀</h1>

<p align="center">
  <strong>The Developer Intelligence Platform — Measure. Improve. Prove.</strong>
</p>

<p align="center">
  DevScore is an AI-powered system that analyzes developer contributions, architectural choices, and coding practices across their GitHub repositories to generate standardized engineering tiers (Baseline to Principal). Leverage Groq/Llama-3 for intelligent insights and dynamically generate shareable "GitProof" badges for your portfolio.
</p>

## ✨ Features

- **GitHub Integration**: Authenticate instantly via GitHub OAuth.
- **Deep Architectural Audit**: Uses AI (Groq + Llama-3.3-70b) to audit your repositories, evaluate file systems, and configuration complexity.
- **Intelligent Scoring Pipeline**: Calculates a standardized "Engineering Tier," score breakdown (Consistency, Impact, Depth) via Celery background workers.
- **Actionable AI Recommendations**: Delivers highly specific, technical "Growth Vectors".
- **GitProof Badges**: Shareable, dynamic SVG/UI widgets reflecting your real-world footprint.
- **Industrial Dark & Light Themes**: Stunning, animated UI crafted with React, Vite, Framer Motion, and Tailwind CSS.
- **K3s Ready**: Production-level orchestrations via ConfigMaps configurations.

---

## 🏗️ Architecture Stack

| Layer           | Technologies Used                                     |
|-----------------|-------------------------------------------------------|
| **Frontend**    | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| **Backend**     | Django 5.x, Django REST Framework                     |
| **Database**    | PostgreSQL 15                                         |
| **Task Queue**  | Celery, Redis                                         |
| **AI Inference**| Groq API (Llama 3.3 70B)                              |
| **Auth**        | GitHub OAuth 2.0                                      |
| **Deployment**  | Docker Compose, K3s (Kubernetes)                      |

---

## ⚡ Quick Start (Development)

### 1. Environment Setup

Clone the repository and prepare your environment files:

```bash
# In the repository root
cp .env.example .env
```

Fill in the following credentials inside your new `.env` file:
- **GitHub OAuth:** Create an OAuth app at [GitHub Developer Settings](https://github.com/settings/developers). Set the Callback URL to `http://localhost:5173/auth/callback`.
- **Groq API:** Get your AI keys at [Groq Console](https://console.groq.com/).
- **Fernet Key:** Generate an encryption key for securely storing tokens in DB:

    ```bash
    python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    ```

### 2. Bootstrapping the Backend

We use Docker Compose to spin up the database, cache, Django backend, and Celery workers:

```bash
docker compose up --build -d
```

*Wait for the containers to spin up and migrations to automatically apply.*

### 3. Running the Frontend

Navigate to the frontend directory, install dependencies, and launch Vite:

```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application

* **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Backend API Services:** [http://localhost:8000/api/](http://localhost:8000/api/)
- **Django Admin Panel:** [http://localhost:8000/admin](http://localhost:8000/admin)

---

## 🛠️ Codebase Structure

- `/backend/github/` - Handles OAuth handshakes, repository cloning logic, and GitHub GraphQL/REST integrations.
- `/backend/scoring/` - Grading algorithms calculating aggregate scores across all fetched metrics.
- `/backend/analytics/` - Auditory logic coordinating with LLMs to detect technical debt and architectural patterns.
- `/backend/recs/` - Orchestrates the generation of "Growth Vector" advice to push users to the next engineering tier.
- `/backend/badges/` - SVG widget generation to be embedded externally.
- `/frontend/src/` - React SPA with custom "industrial" UI components, animations, and visualizations.

---

## 🔒 Security

- OAuth tokens are encrypted at rest using Fernet symmetric encryption.
- No source code is permanently stored; file trees and config snippets are only fetched temporarily during the auditing cycle.
- All backend pipelines are strongly typed and formatted adhering to rigorous `flake8` standards.
