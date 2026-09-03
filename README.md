<div align="center">

# 🏛️ JanSetu

### AI for Digital Public Infrastructure & Governance

**Turning scattered citizen voices into ranked, explainable, data-backed public investment decisions.**

[![Status](https://img.shields.io/badge/status-prototype-orange)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#-license)
[![Made with](https://img.shields.io/badge/made%20with-React%20%7C%20FastAPI%20%7C%20AI-1B2340)](#-tech-stack)
[![Languages](https://img.shields.io/badge/languages-10%2B%20Indian%20languages-E8A33D)](#)
[![Cost](https://img.shields.io/badge/deployment%20cost-%240-2ea44f)](#-cost-philosophy)

[Overview](#-overview) •
[Features](#-key-features) •
[How It Works](#-how-it-works) •
[Tech Stack](#-tech-stack) •
[Getting Started](#-getting-started) •
[Roadmap](#-roadmap)

</div>

---

## 📌 Overview

Citizen development requests — roads, water, health, education — reach the government through scattered channels: phone calls, SMS, WhatsApp, in-person visits, in dozens of Indian languages. There's no unified way to understand demand at scale, correlate it with real infrastructure gaps, or decide **where limited public funds should go first**.

**JanSetu** is a Digital Public Good that fixes this:

1. 🎙️ **Listens** — citizens report issues by voice, text, or WhatsApp, in their own language. No app to install, no literacy barrier.
2. 🧠 **Understands** — AI transcribes, translates, categorises, and scores the urgency of each request.
3. 🔗 **Correlates** — requests are combined with demographic data, infrastructure indices, and existing public investment plans.
4. 📊 **Recommends** — policymakers see a ranked, *explainable* list of which areas need investment first, and why.
5. 🔁 **Closes the loop** — citizens get status updates back, in their own language.

> Built as an open, pluggable layer — designed to sit alongside existing systems like CPGRAMS and state grievance portals, not replace them.

---

## ✨ Key Features

| | |
|---|---|
| 🎙️ **Multilingual intake** | Voice, text & WhatsApp across 10+ Indian languages |
| 🤖 **Smart categorisation** | AI auto-tags requests — roads, water, health, education, electricity, sanitation |
| 📍 **Hotspot mapping** | Geo-tagged visualisation of demand across wards & districts |
| 📊 **Explainable priority engine** | Scores projects using demand + infrastructure gap + budget gap — never a black box |
| 🖥️ **Policymaker dashboard** | Ranked recommendations with full reasoning, at a glance |
| 🔁 **Feedback loop** | Automatic status updates to citizens, in their own language |
| 🌐 **Open architecture** | API-first, easy to integrate with CPGRAMS, MyGov & state portals |
| 💸 **Zero-cost deployable** | Runs entirely on free-tier infrastructure — see [Cost Philosophy](#-cost-philosophy) |

---

## 🏗️ How It Works

```
Citizen Input (Voice / Text / WhatsApp)
        │
        ▼
Speech-to-Text & Language Detection
        │
        ▼
NLP: Translation & Categorisation
        │
        ▼
Geo-tagging & Hotspot Clustering
        │
        ▼
Correlation Engine  (+ Demographic, Infra & Budget Data)
        │
        ▼
Priority Scoring & Ranking
        │
        ▼
Policymaker Dashboard  ──►  Approved Project & Status Update  ──►  back to Citizen
```

**Clustering, in plain terms:** complaints worded differently but meaning the same thing (*"paani nahi aa raha"* vs *"water not coming"*) are grouped by AI into a single issue cluster per area. Complaint density is also clustered geographically to flag **hotspot zones** — areas needing combined, multi-issue investment rather than a single scheme.

### Priority Scoring Formula

```
Priority Score = (Demand Score × 0.45) + (Infrastructure Gap × 0.30) + (Budget Gap × 0.25)
```

Every recommendation shown to a policymaker includes this breakdown — priorities are transparent, never a black box.

---

## 🛠️ Tech Stack

Designed to be deployable at **zero cost**, so any state or city government can adopt it — not just run it as a demo.

<details open>
<summary><b>Frontend — Web Application</b></summary><br>

| Purpose | Technology |
|---|---|
| Framework | React.js (Vite) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Maps | Leaflet.js + OpenStreetMap *(free, no API key)* |
| State management | React Context / Zustand |

> Citizen intake is intentionally **app-less** — voice, WhatsApp, and a lightweight web form — so there's zero adoption barrier, even on basic phones or with low literacy.

</details>

<details>
<summary><b>Backend</b></summary><br>

| Purpose | Technology |
|---|---|
| API server | FastAPI (Python) |
| Auth | Firebase Auth / JWT |
| API style | REST |

</details>

<details>
<summary><b>AI / NLP Layer</b></summary><br>

| Purpose | Technology | Cost |
|---|---|---|
| Speech-to-Text & translation (Indian languages) | **Bhashini API** (Govt. of India) | Free |
| Browser-side voice demo | Web Speech API | Free |
| Classification, summarisation & explainable reasoning | **NVIDIA NIM** (build.nvidia.com — Llama 3.3 / Nemotron) | Free tier |
| Geo-clustering of hotspots | Python (scikit-learn — DBSCAN) | Free |
| Optional, higher-scale | Google Cloud Vertex AI / Gemini API | $300 free trial credit |

</details>

<details>
<summary><b>Data Layer</b></summary><br>

| Purpose | Technology |
|---|---|
| Primary database | PostgreSQL + PostGIS (Supabase free tier) |
| Large-scale correlation | BigQuery |
| Real-time status updates | Firebase Firestore |

</details>

<details>
<summary><b>Citizen Intake Channels</b></summary><br>

| Channel | Technology | Cost |
|---|---|---|
| WhatsApp | WhatsApp Cloud API (Meta, direct) | Free (service conversations) |
| Voice call | Twilio Voice + Bhashini | Free tier |
| Web form | React app route | Free |

</details>

<details>
<summary><b>Deployment</b></summary><br>

| Purpose | Technology |
|---|---|
| Frontend hosting | Vercel / Netlify |
| Backend hosting | Render / Google Cloud Run (free tier) |
| Containerisation | Docker |
| CI/CD | GitHub Actions |

</details>

---

## 📁 Project Structure

```
jansetu/
├── frontend/                       # React Web App (Policymaker Dashboard + Web intake)
│   ├── src/
│   │   ├── components/             # Cards, Charts, WardList, ComplaintForm
│   │   ├── pages/
│   │   │   ├── CitizenPortal.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/                # API calls (axios/fetch wrapper)
│   │   ├── context/                 # Global state
│   │   └── App.jsx
│   └── package.json
│
├── backend/                         # FastAPI server
│   ├── app/
│   │   ├── routes/
│   │   │   ├── complaints.py        # submit / fetch complaints
│   │   │   ├── dashboard.py         # priority scores, analytics
│   │   │   └── auth.py
│   │   ├── models/                  # DB schemas (SQLAlchemy)
│   │   ├── services/
│   │   │   ├── nlp_service.py       # NVIDIA NIM / Bhashini calls
│   │   │   ├── translation_service.py
│   │   │   └── priority_engine.py   # scoring algorithm
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── ai-models/                       # Classification & clustering logic
│   └── clustering.py
│
├── whatsapp-bot/                    # WhatsApp Cloud API webhook handler
│   └── webhook.py
│
├── prototype/                       # Standalone HTML/JS demo (no backend needed)
│   └── index.html
│
└── docs/
    └── architecture-diagram.png
```

---

## 🚀 Getting Started

### Try the prototype (zero setup)

A self-contained, interactive demo is included at `prototype/index.html` — no server or dependencies required.

```bash
open prototype/index.html
```

It includes a citizen complaint form with a live "AI reasoning" trace, and a policymaker dashboard with priority ranking, category breakdown, and a live request feed.

### Run the full stack locally

```bash
# clone the repo
git clone https://github.com/<your-username>/jansetu.git
cd jansetu

# backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

Add your API keys (Bhashini, NVIDIA NIM, WhatsApp Cloud API) to a `.env` file in `backend/` — see `.env.example`.

---

## 💸 Cost Philosophy

Every component in this stack has a genuinely free tier — Bhashini, NVIDIA NIM, WhatsApp Cloud API service conversations, Leaflet/OpenStreetMap, Supabase, Vercel/Netlify — with Google Cloud's $300 trial credit available for heavier workloads if needed.

This is a deliberate choice: **a Digital Public Good should be deployable by any state or city government, regardless of budget.**

---

## 🗺️ Roadmap

- [ ] Integration with **CPGRAMS** and state grievance portals via open APIs
- [ ] Predictive analytics to forecast infrastructure demand *before* complaints arise
- [ ] Public transparency ledger tracking project execution against citizen demand
- [ ] Expansion to all 22 scheduled Indian languages plus major regional dialects
- [ ] Offline-first IVR support for low-connectivity rural areas
- [ ] Integration with **PM Gati Shakti** / Smart City data for richer infrastructure indices

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built as an open Digital Public Good — for citizens, by design.**

</div>
