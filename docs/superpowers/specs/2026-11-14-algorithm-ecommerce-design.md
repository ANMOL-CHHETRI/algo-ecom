# Algorithm-Driven E-Commerce Platform — Design Document
**Date:** 2026-11-14  
**Project:** BCA Final Year — Algorithm-Driven E-Commerce (Butwal, Nepal)  
**Author:** Student / AI-assisted

---

## Intent & Why

BCA final-year academic project demonstrating four Data Structures & Algorithms implemented from scratch inside a real e-commerce product. The platform must be explainable live to an examiner — every algorithmic decision must be traceable through a dedicated Algorithm Lab UI.

## Goals

- Working e-commerce platform (browse, cart, checkout, order tracking)
- Admin dashboard with delivery route optimization
- Courier mobile-responsive portal
- Algorithm Lab with animated step-through for 4 DSA algorithms
- Full localization for Butwal, Lumbini Province, Nepal (NPR, Nepalese phone, Butwal road graph)
- Seed data seeded and runnable via `docker compose up` on a laptop

## Non-Goals

- Real payment processing (mock eSewa/Khalti modal only)
- Production deployment / cloud hosting
- Real-time WebSocket updates (polling is fine)
- Mobile native app

## Anti-Goals (Failure Conditions)

- Black-box external ML/AI libraries for the 4 algorithms — must be pure TypeScript
- Algorithms that cannot be explained step-by-step in the Lab UI
- Hardcoded English-only content (must use NPR, Nepalese addresses)

## Constraints

- React 18 + Vite + TypeScript + Tailwind CSS + React Router v6
- Node.js + Express + TypeScript + Prisma ORM + PostgreSQL 15
- bcryptjs + jsonwebtoken (HTTP-only cookies)
- React-Leaflet + OpenStreetMap (no paid map API)
- Recharts for analytics
- React Hook Form + Zod for validation
- Vitest for unit tests
- Docker Compose for local Postgres
- No external algorithm libraries (cosine, graph, string distance must be hand-rolled)

## Approaches Considered

### A. Monorepo with shared types package (Turborepo)
Full turborepo setup with `packages/types`. Clean but adds tooling complexity for a viva demo.

### B. Simple monorepo with two package.json files (CHOSEN)
`client/` and `server/` each have their own `package.json`. Root has concurrently dev script. Shared types duplicated or symlinked. Simpler to explain to examiner, zero Turborepo concepts to defend.

### C. Single Express app serving React build
Simpler deploy but terrible DX; Vite HMR lost. Rejected.

**Chosen: B** — simplest setup the examiner can understand and run with one command.

## Architecture

```
algorithm-driven-ecommerce/
├── docker-compose.yml          # Postgres 15 + pgAdmin
├── .env.example
├── package.json                # root: "dev" runs both via concurrently
├── client/                     # Vite + React 18 + TS + Tailwind
│   └── src/
│       ├── algorithms/         # client-side viz helpers (no business logic)
│       ├── components/
│       ├── contexts/           # AuthContext, CartContext
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── services/           # axios instances
│       └── types/
└── server/                     # Express + TS + Prisma
    ├── src/
    │   ├── algorithms/         # 4 pure-TS DSA modules
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   └── routes/
    └── prisma/
        ├── schema.prisma       # 14 models
        └── seed.ts
```

## The 4 Algorithms (pure TypeScript)

### 1. Cosine Similarity (Content-Based Recommendation)
- Build feature vectors from: category one-hot, brand one-hot, price tier (normalized 0–1), tag multi-hot, spec attributes
- `buildProductVector(product, vocabulary): number[]`
- `calculateCosineSimilarity(a: number[], b: number[]): number`
- `getRecommendations(productId, limit): RecommendedProduct[]`
- `getRecommendationExplanation(idA, idB): ExplanationPayload` — returns vectors, dot product, dimension-by-dimension breakdown

### 2. Dijkstra Shortest Path
- Weighted adjacency list; binary min-heap priority queue (hand-rolled, no library)
- Input: 10 Butwal RoadNode records + 16+ RoadEdge records from DB
- `buildAdjacencyList(nodes, edges): Graph`
- `dijkstra(graph, startId): {distances, previous}`
- `reconstructPath(previous, targetId): string[]`
- `computeDistanceMatrix(nodeIds): number[][]`
- Returns step log array for Lab UI animation

### 3. Nearest-Neighbor TSP (Delivery Sequencing)
- Input: depot node + set of customer delivery node IDs + precomputed Dijkstra distance matrix
- Greedy: always go to closest unvisited node
- Returns: ordered stop array + per-step decision log + total km + comparison vs naive order

### 4. Levenshtein Distance (Typo-Tolerant Search)
- Full DP matrix computation
- Normalize input (lowercase, trim)
- Threshold: if edit distance ≤ 2, suggest correction
- Returns: matrix rows for Lab UI grid rendering + matched products

## Butwal Road Graph

| Node | Name | Type | Lat | Lng |
|------|------|------|-----|-----|
| 1 | Traffic Chowk | DEPOT | 27.7006 | 83.4484 |
| 2 | Golpark | INTERSECTION | 27.7089 | 83.4502 |
| 3 | Kalikanagar | INTERSECTION | 27.6978 | 83.4521 |
| 4 | Milanchowk | INTERSECTION | 27.6952 | 83.4467 |
| 5 | Devinagar | INTERSECTION | 27.6998 | 83.4398 |
| 6 | Deepnagar | INTERSECTION | 27.7034 | 83.4432 |
| 7 | Sukkhanagar | INTERSECTION | 27.7067 | 83.4455 |
| 8 | Horizon Chowk | INTERSECTION | 27.7045 | 83.4523 |
| 9 | Drivertole/Manigram | INTERSECTION | 27.6889 | 83.4476 |
| 10 | Belbas/Tamnagar | INTERSECTION | 27.7012 | 83.4356 |

Key edges (bidirectional, km):
- Traffic Chowk ↔ Golpark: 1.8 km
- Traffic Chowk ↔ Milanchowk: 1.2 km
- Traffic Chowk ↔ Deepnagar: 0.9 km
- Traffic Chowk ↔ Kalikanagar: 1.1 km
- Golpark ↔ Sukkhanagar: 0.7 km
- Golpark ↔ Horizon Chowk: 1.0 km
- Deepnagar ↔ Sukkhanagar: 0.6 km
- Deepnagar ↔ Devinagar: 1.3 km
- Milanchowk ↔ Kalikanagar: 0.8 km
- Milanchowk ↔ Devinagar: 1.5 km
- Milanchowk ↔ Drivertole: 1.9 km
- Kalikanagar ↔ Drivertole: 2.1 km
- Horizon Chowk ↔ Sukkhanagar: 0.5 km
- Devinagar ↔ Belbas: 2.0 km
- Traffic Chowk ↔ Belbas: 2.4 km
- Sukkhanagar ↔ Horizon Chowk: 0.5 km

## Seed Users
- admin@butwalecom.com / Admin@123 (ADMIN)
- courier@butwalecom.com / Courier@123 (COURIER)
- customer@gmail.com / Customer@123 (CUSTOMER)

## Seed Products (35+)
Categories: Electronics, Fashion, Grocery, Home Essentials
Price range: Rs. 250 – Rs. 145,000

## Payment Methods
- Cash on Delivery (default, no modal)
- Mock eSewa / Khalti / Fonepay — confirmation modal with fake transaction ID

## Algorithm Lab UI
- 4 tabs, one per algorithm
- Animated step-through at 600ms intervals with pause/resume/step controls
- Cosine Lab: vector display, dot product, dimension breakdown
- Dijkstra Lab: node table, priority queue state, path highlight on Leaflet map
- TSP Lab: Leaflet map with numbered pins, decision log per step
- Levenshtein Lab: full DP grid rendered as HTML table, backtrack highlight

## Execution Environment
- `docker compose up -d` starts Postgres on port 5432
- `npm run dev` from root starts both client (port 5173) and server (port 3000)
- `npm run seed` from root runs `ts-node server/prisma/seed.ts`
- Examiner opens http://localhost:5173
