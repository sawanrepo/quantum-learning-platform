# AI-Powered Interactive Quantum Computing Learning Platform

A production-quality full-stack quantum simulation, visualization, and educational platform built with **FastAPI**, **Qiskit**, **Google Gemini AI**, **React**, **TypeScript**, and **Three.js**.

---

## 🌟 Key Features

1. **Quantum Digital Laboratory**:
   - Interactive drag-and-click Quantum Circuit Workstation supporting single-qubit rotation gates ($H, X, Y, Z, S, T, R_x, R_y, R_z$), multi-qubit entangling gates ($CNOT, SWAP$), and measurement operations.
   - Real-time simulation powered by **Qiskit Aer** and linear algebra statevector matrix engines.
   - Measurement probability histograms, statevector amplitudes, and density matrices.

2. **3D Interactive Bloch Sphere Inspector**:
   - Renders 3D Bloch spheres for every qubit in real-time using **Three.js**.
   - Visualizes state vector orientation $(\theta, \phi)$, $|0\rangle, |1\rangle$ poles, and equator.
   - Responds to gate applications dynamically with drag-to-rotate viewport support.

3. **Gemini AI Quantum Professor**:
   - Integrated AI assistant powered by **Google Gemini API** (`gemini-2.5-flash`).
   - Contextual actions: *"Explain This Circuit"*, *"Why This Result?"*, *"Debug Circuit"*, and *"Export Framework Code"*.
   - Generates standalone Python scripts for **IBM Qiskit**, **Xanadu PennyLane**, and **Google Cirq**.

4. **Structured Curriculum & Auto-Evaluated Challenges**:
   - 4 learning tracks: *Fundamentals*, *Quantum Circuits*, *Entanglement*, and *Algorithms*.
   - Includes interactive theory, preloaded circuits, quizzes, and automated circuit challenge evaluators measuring quantum state fidelity.

5. **College Presentation Suite**:
   - Pre-loaded interactive demonstration flows for **Superposition**, **Bell State Entanglement**, and **Quantum Teleportation Protocol**.

---

## 📂 Project Structure

```text
quantum-learning-platform/
│
├── frontend/                     # React + TypeScript + Three.js Frontend
│   ├── src/
│   │   ├── components/           # quantum, visualization, ai, learning, common
│   │   ├── pages/                # Home, PlaygroundPage, ModulesPage, CollegeDemosPage, DashboardPage
│   │   ├── services/             # API integration layer
│   │   ├── types/                # TypeScript interfaces
│   │   ├── index.css             # Dark scientific design tokens
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                      # FastAPI Python Backend
│   ├── app/
│   │   ├── api/                  # REST endpoints: quantum, ai, learning, assessment, demos
│   │   ├── config/               # Settings & environment parser
│   │   ├── schemas/              # Pydantic models
│   │   ├── services/
│   │   │   ├── quantum/          # Qiskit simulator & Bloch math
│   │   │   ├── ai/               # Google Gemini API integration
│   │   │   ├── learning/         # Curriculum data
│   │   │   └── assessment/       # Challenge evaluator
│   │   └── main.py
│   ├── venv/                     # Python virtual environment
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
├── docs/                         # System architecture documentation
├── scripts/                      # Startup scripts
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (FastAPI + Qiskit)

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

Set your Gemini API key in `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
HOST=0.0.0.0
```

Start the FastAPI backend server:
```bash
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 3. One-Click Launch (Windows)
Double-click `scripts/start_dev.bat` to launch both backend and frontend servers simultaneously!
