# Quantum Learning Platform — Frontend

React + TypeScript frontend for the AI-Powered Interactive Quantum Computing Learning Platform.

## Tech Stack

- **React 19** + **TypeScript 5.8**
- **Vite** — Build tool with HMR
- **TanStack Router** — File-based routing
- **TanStack React Query** — Data fetching
- **Three.js** / **React Three Fiber** — 3D Bloch sphere
- **Tailwind CSS** — Styling
- **Radix UI** — Accessible UI primitives
- **Recharts** — Probability charts

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
src/
├── routes/           # Pages (Quantum Lab, Modules, Demos, Dashboard)
├── components/
│   ├── quantum/      # CircuitCanvas, BlochSphere, GateLibrary, ProfessorPanel
│   └── ui/           # Radix/shadcn component library
├── lib/              # API client, circuit model, state management
└── styles.css        # Dark theme design tokens
```
