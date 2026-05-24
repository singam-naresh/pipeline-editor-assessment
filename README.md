# Pipeline Editor Assessment

A visual pipeline editor built with **React Flow** and **FastAPI**. Drag, connect, and configure processing nodes on a canvas, then submit the pipeline to the backend for structural analysis — including real DAG (Directed Acyclic Graph) cycle detection.

---

## Features

- **Drag-and-drop canvas** — drag nodes from the toolbar onto the React Flow canvas
- **Visual connections** — draw edges between node handles to wire up a pipeline
- **9 node types** — Input, Output, LLM, Text, API, Filter, Database, Decision, Delay
- **Dynamic Text node** — auto-resizes as you type; detects `{{variable}}` tokens and creates live input handles per variable
- **BaseNode abstraction** — all nodes share a consistent card layout, accent colours, and handle system
- **Pipeline submission** — submit button POSTs the current graph to the FastAPI backend
- **DAG validation** — backend runs iterative DFS cycle detection and returns whether the graph is acyclic
- **Result modal** — displays node count, edge count, and DAG status in a styled popup (no browser alerts)

---

## Tech Stack

**Frontend**
- React 18
- React Flow — canvas, nodes, edges, handles
- Zustand — global pipeline state

**Backend**
- FastAPI — REST API
- Pydantic v2 — request/response validation
- Uvicorn — ASGI server
- Python 3.10+

---

## Project Structure

```
pipeline-editor-assessment/
├── README.md
├── .gitignore
├── frontend/
│   ├── src/
│   │   ├── nodes/          # BaseNode + 9 node components
│   │   ├── App.js
│   │   ├── ui.js           # React Flow canvas
│   │   ├── toolbar.js      # Draggable node palette
│   │   ├── store.js        # Zustand state (nodes, edges)
│   │   ├── submit.js       # Submit button + result modal
│   │   └── draggableNode.js
│   ├── public/
│   ├── package.json
│   └── .gitignore
└── backend/
    ├── main.py             # FastAPI app + DAG detection
    └── .gitignore
```

---

## Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- pip

---

### Run the Backend

```bash
cd backend
pip install fastapi uvicorn pydantic
py -m uvicorn main:app --reload
```

Backend runs at: `http://127.0.0.1:8000`  
Interactive API docs: `http://127.0.0.1:8000/docs`

---

### Run the Frontend

```bash
cd frontend
npm install
npm start
```

App opens at: `http://localhost:3000`

---

## API Reference

### `GET /`

Health check.

```json
{ "Ping": "Pong" }
```

### `POST /pipelines/parse`

Accepts the current React Flow graph and returns structural analysis.

**Request**
```json
{
  "nodes": [{ "id": "customInput-1" }, { "id": "llm-1" }],
  "edges": [{ "id": "e1", "source": "customInput-1", "target": "llm-1" }]
}
```

**Response**
```json
{
  "num_nodes": 2,
  "num_edges": 1,
  "is_dag": true
}
```

`is_dag` is `false` when the graph contains a directed cycle (e.g. A → B → C → A).

---

## DAG Validation

The backend uses **iterative DFS with three-colour marking** to detect cycles:

| Colour | Meaning |
|--------|---------|
| WHITE | Not yet visited |
| GRAY | Currently on the DFS stack |
| BLACK | Fully processed |

If a **GRAY** node is encountered during traversal, a back-edge (cycle) exists and `is_dag` returns `false`. This correctly handles linear chains, diamonds, self-loops, and disconnected components.

---

## Usage

1. Start both servers (backend first, then frontend).
2. Drag nodes from the toolbar onto the canvas.
3. Connect node handles by dragging from one handle to another.
4. Click **Submit Pipeline** to analyse the graph.
5. The modal displays node count, edge count, and DAG status.

**To test cycle detection:** connect nodes in a loop (A → B → C → A) and submit — the modal will show **✗ Contains Cycle**.
