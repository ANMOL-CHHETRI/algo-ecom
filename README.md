# Algorithm-Driven E-Commerce Platform
### Localized for Butwal, Lumbini Province, Nepal
**BCA Final Year Academic Project** • Focus: Explainable Data Structures & Algorithms, Route Optimization & Multi-Role Systems

---

## 🌟 Project Overview
**Algorithm-Driven E-Commerce Platform** is a full-stack, production-grade web application built from scratch to demonstrate the real-world application of four fundamental computer science algorithms in a localized Nepalese market:

1. **Content-Based Recommendation Engine** (`cosineSimilarity.ts`): Computes dot products and vector norms over multi-hot categorical, brand, and normalized price-tier embeddings.
2. **Shortest-Path Road Network Routing** (`dijkstra.ts`): Implements Dijkstra's SSSP using a binary min-heap priority queue over 10 real Butwal intersections.
3. **Multi-Stop Delivery Batch Sequencing** (`nearestNeighbor.ts`): Solves the Traveling Salesperson Problem (TSP) heuristic for minimum transit distance and fuel consumption.
4. **Typo-Tolerant Search Auto-Suggestion** (`levenshteinDistance.ts`): 2D dynamic programming matrix computing minimum edit operations for search queries.

---

## 🇳🇵 Butwal Localization Features
- **Currency**: Nepalese Rupee (`NPR` / `Rs. 4,500`) formatted consistently.
- **Phone Validation**: Standard Nepalese mobile format (`+977-98XXXXXXXX` / `97XXXXXXXX`).
- **Payment Methods**: Cash on Delivery (COD) + Mock Nepalese Digital Wallets (eSewa / Khalti / Fonepay).
- **Road Network**: 10 real interconnected Butwal intersections (Traffic Chowk Depot, Golpark, Devinagar, Milanchowk, Deepnagar, Kalikanagar, Sukkhanagar, Horizon Chowk, Drivertole, Belbas) with realistic distance weights in km.

---

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide React, Recharts (analytics), React-Leaflet + Leaflet + OpenStreetMap.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL 15, bcryptjs, jsonwebtoken (HTTP-only cookies).
- **Testing**: Vitest for pure algorithm unit tests.
- **DevOps**: Docker Compose for local PostgreSQL and pgAdmin.

---

## 🚀 Quick Start Guide (3 Simple Steps)

### Step 1: Start PostgreSQL Database
```bash
docker compose up -d
```
*(Starts PostgreSQL on port 5432 and pgAdmin on port 5050)*

### Step 2: Install Dependencies & Seed Database
```bash
# In server directory:
cd server
npm install
npx prisma migrate dev --name init
npm run seed

# In client directory:
cd ../client
npm install
```

### Step 3: Start the Application
From the root folder:
```bash
npm run dev
```
- Storefront & Algo Lab: **http://localhost:5173**
- Backend API: **http://localhost:3000**
- Health Check: **http://localhost:3000/health**

---

## 🔑 Demo Login Credentials (BCA Viva)

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@butwalecom.com` | `Admin@123` | Analytics, Inventory CRUD, Route Optimization, Batch Dispatch |
| **Courier** | `courier@butwalecom.com` | `Courier@123` | Mobile Stop Navigation, Status Toggles |
| **Customer** | `customer@gmail.com` | `Customer@123` | Catalog, Cosine Recommendations, Leaflet Checkout, Tracking |

*(Tip: The Login page features 1-click autofill buttons for fast viva examiner demonstrations!)*

---

## 🔬 Algorithm Laboratory (Viva Demonstration)
Navigate to **http://localhost:5173/algo-lab** to inspect all four algorithms live:
1. **Cosine Similarity Lab**: Select any two products to view vector embeddings, dot products, and attribute overlap breakdown.
2. **Dijkstra Visualizer**: Select Source and Target nodes to step through binary min-heap priority queue extractions, distance relaxation tables, and path rendering on Leaflet.
3. **Nearest-Neighbor TSP Lab**: Select 4 to 8 delivery stops in Butwal to watch the greedy decision steps unfold live with total distance reductions.
4. **Levenshtein Lab**: Type custom strings to render the complete 2D dynamic programming grid with highlighted backtracked edit paths.

---

## 📁 Repository Structure
```text
algorithm-driven-ecommerce/
├── client/                      # React 18 + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/          # ProductCard, RecommendationModal, DeliveryMap, PaymentModal
│   │   ├── components/admin/    # StatsCard, ProductForm, RouteOptimizationPanel, BatchMap
│   │   ├── components/courier/  # StopCard
│   │   ├── components/lab/      # CosineLab, DijkstraLab, TSPLab, LevenshteinLab
│   │   ├── contexts/            # AuthContext, CartContext
│   │   ├── layouts/             # CustomerLayout, AdminLayout, CourierLayout
│   │   ├── pages/               # StorePage, ProductDetailPage, CartPage, CheckoutPage, OrdersPage
│   │   ├── services/            # Axios API client
│   │   └── types/               # TypeScript models & formatters
├── server/                      # Node.js + Express + Prisma backend
│   ├── src/
│   │   ├── algorithms/          # PURE TypeScript algorithms (Zero black-box libraries)
│   │   │   ├── cosineSimilarity.ts
│   │   │   ├── dijkstra.ts
│   │   │   ├── nearestNeighbor.ts
│   │   │   ├── levenshteinDistance.ts
│   │   │   └── featureExtraction.ts
│   │   │   └── __tests__/       # Vitest unit test suites
│   │   ├── controllers/         # Auth, Product, Cart, Order, Delivery, Algo controllers
│   │   ├── middleware/          # authMiddleware, roleGuard, errorHandler, validate
│   │   ├── routes/              # Express API routers
│   │   └── server.ts
│   └── prisma/
│       ├── schema.prisma        # 14 Relational Models
│       └── seed.ts              # 36 Products, 10 Road Nodes, 16 Edges, 5 Orders
├── docs/                        # Architecture diagrams, ERD, and Viva documentation
├── docker-compose.yml          # PostgreSQL + pgAdmin
└── package.json                 # Monorepo concurrently script
```

---

## 🧪 Running Unit Tests
To verify all 4 pure TypeScript algorithms:
```bash
cd server
npm run test
```
All unit tests verify edge conditions:
- Empty strings and classic edit operations in Levenshtein
- Zero-vector guards and orthogonal dimensions in Cosine Similarity
- Disconnected components and priority heap order in Dijkstra
- Greedy choice verification and naive comparison in TSP

---

## 📜 License & Academic Integrity
Developed as a BCA Final Year Project. Designed specifically for academic defense and viva presentations.
