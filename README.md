# Pipeline Editor Assessment

A visual pipeline editor built with React Flow and FastAPI. Drag, connect, and configure processing nodes on a canvas, then submit the pipeline to the backend for structural analysis — including real DAG (Directed Acyclic Graph) cycle detection.

---

## Features

- **Drag-and-drop canvas** — drag nodes from the toolbar onto the React Flow canvas
- **Visual connections** — draw edges between node handles to wire up a pipeline
- **9 node types** — Input, Output, LLM, Text, API, Filter, Database, Decision, Delay
- **Dynamic Text node** — auto-resizes as you type; detects `{{variable}}` tokens and creates live input handles for each one
- **BaseNode abstraction** — all nodes share a consistent card layout, theming, and handle system
- **Pipeline analysis** — submit button sends the current graph to the FastAPI backend
- **DAG validation** — backend runs iterative DFS cycle detection and returns whether the graph is acyclic
- **Result modal** — displays node count, edge count, and DAG status in a styled popup

---

## Tech Stack

**Frontend**
- [React 18](https://react.dev/)
- [React Flow](https://reactflow.dev/) — canvas, nodes, edges, handles
- [Zustand](https://zustand-demo.pmnd.rs/) — global pipeline state

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — REST API
- [Pydantic v2](https://docs.pydantic.dev/) — request validation
- [Uvicorn](https://www.uvicorn.org/) — ASGI server
- Python 3.10+

---

## Project Structure

```
Assessment/
├── frontend/          # React application
│   ├── src/
│   │   ├── nodes/     # All node components + BaseNode abstraction
│   │   ├── App.js
│   │   ├── ui.js      # React Flow canvas
│   │   ├── toolbar.js # Draggable node palette
│   │   ├── store.js   # Zustand state
│   │   └── submit.js  # Submit button + result modal
│   └── package.json
└── backend/           # FastAPI application
    └── main.py
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- pip

---

### Run the Frontend

```bash
cd frontend
npm install
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000).

---

### Run the Backend

```bash
cd backend
pip install fastapi uvicorn pydantic
py -m uvicorn main:app --reload
```

The API is available at [http://127.0.0.1:8000](http://127.0.0.1:8000).  
Interactive docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## API Reference

### `POST /pipelines/parse`

Accepts the current React Flow graph and returns structural analysis.

**Request body**
```json
{
  "nodes": [{ "id": "customInput-1", "..." : "..." }],
  "edges": [{ "id": "e1", "source": "customInput-1", "target": "llm-1" }]
}
```

**Response**
```json
{
  "num_nodes": 3,
  "num_edges": 2,
  "is_dag": true
}
```

`is_dag` is `false` when the graph contains a directed cycle (e.g. A → B → C → A).

---

## DAG Detection

The backend uses **iterative DFS with three-colour marking**:

- **WHITE** — node not yet visited  
- **GRAY** — node currently on the DFS stack  
- **BLACK** — node fully processed  

If a GRAY node is encountered during traversal, a back-edge (cycle) has been found and `is_dag` returns `false`. This correctly handles chains, diamonds, self-loops, and disconnected components.

---

## Usage

1. Start both the frontend and backend servers.
2. Drag nodes from the toolbar onto the canvas.
3. Connect node handles by dragging from one handle to another.
4. Click **Submit Pipeline** to analyse the graph.
5. The modal shows the node count, edge count, and whether the graph is a valid DAG.

To test cycle detection, create a loop: e.g. connect Node A → B → C → A and submit — the modal will show **✗ Contains Cycle**.
