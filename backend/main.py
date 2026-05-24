from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(
    title="Pipeline Editor API",
    description="Analyses ReactFlow pipelines and detects DAG cycles.",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://pipeline-editor-assessment.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request schema ────────────────────────────────────────────────────────────

class Node(BaseModel):
    id: str
    # Accept any extra ReactFlow fields without failing validation
    model_config = {"extra": "allow"}

class Edge(BaseModel):
    id: str
    source: str
    target: str
    model_config = {"extra": "allow"}

class PipelinePayload(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


# ── DAG detection ─────────────────────────────────────────────────────────────

def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    """
    Return True when the directed graph formed by `edges` is acyclic.

    Uses iterative DFS with three-colour marking:
      WHITE (0) – not yet visited
      GRAY  (1) – currently on the DFS stack (cycle if we see this again)
      BLACK (2) – fully processed, no cycle through this node

    An empty graph is trivially a DAG.
    """
    WHITE, GRAY, BLACK = 0, 1, 2

    # Build adjacency list keyed by node id
    adj: dict[str, list[str]] = {n.id: [] for n in nodes}
    for edge in edges:
        # Guard against edges referencing nodes not in the node list
        if edge.source in adj:
            adj[edge.source].append(edge.target)

    color: dict[str, int] = {n.id: WHITE for n in nodes}

    for start in adj:
        if color[start] != WHITE:
            continue

        # Iterative DFS – stack holds (node_id, iterator_over_neighbours)
        stack = [(start, iter(adj[start]))]
        color[start] = GRAY

        while stack:
            node, neighbours = stack[-1]
            try:
                neighbour = next(neighbours)
                if neighbour not in color:
                    # Edge to an unknown node – skip safely
                    continue
                if color[neighbour] == GRAY:
                    # Back-edge found → cycle exists
                    return False
                if color[neighbour] == WHITE:
                    color[neighbour] = GRAY
                    stack.append((neighbour, iter(adj.get(neighbour, []))))
            except StopIteration:
                # All neighbours processed – mark black and pop
                color[node] = BLACK
                stack.pop()

    return True


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"Ping": "Pong"}


@app.post("/pipelines/parse")
def parse_pipeline(payload: PipelinePayload):
    return {
        "num_nodes": len(payload.nodes),
        "num_edges": len(payload.edges),
        "is_dag":    is_dag(payload.nodes, payload.edges),
    }
