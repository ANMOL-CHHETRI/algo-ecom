# Algorithm-Driven E-Commerce Platform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete full-stack e-commerce platform with 4 hand-rolled DSA algorithms, localized for Butwal, Nepal, runnable locally via Docker + npm.

**Architecture:** React 18 + Vite client / Express + Prisma server in a simple monorepo; PostgreSQL via Docker Compose; 4 pure-TypeScript algorithm modules; React-Leaflet map for delivery visualization.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide React, Recharts, React-Leaflet, React Hook Form + Zod, Axios / Node.js, Express, Prisma, PostgreSQL 15, bcryptjs, jsonwebtoken, Vitest, ts-node

**Spec:** `docs/superpowers/specs/2026-11-14-algorithm-ecommerce-design.md`

## Global Constraints

- Currency: NPR, displayed as `Rs. X,XXX` throughout — never USD
- Phone validation: Nepalese format `+977-98XXXXXXXX` or `97XXXXXXXX`
- All 4 algorithm files in `server/src/algorithms/` must be pure TypeScript — zero external algorithm libraries
- Prisma models: exactly 14 as specified in the design doc
- Seed creates exactly 3 users, 35+ products, 10 road nodes, 16+ edges, 5 sample orders
- Ports: client=5173, server=3000, postgres=5432
- JWT stored in HTTP-only cookies (not localStorage)
- Node ≥ 18, npm workspaces not used (two separate package.json)

## Review Focus

- **Prisma transaction on checkout:** stock must decrement atomically; concurrent orders must not oversell
- **Dijkstra with disconnected graph:** if a delivery node has no path to depot, return Infinity and log it — do not crash
- **Levenshtein with empty string inputs:** both empty → distance 0; one empty → length of other — handle in DP init
- **Cosine similarity with zero-vector:** if a product has no features, similarity = 0, not NaN — guard denominator
- **JWT cookie on cross-origin dev:** client=5173, server=3000; CORS must allow credentials and set SameSite=None for local dev

---

## Task 1: Monorepo Scaffold & Tooling

**Files:**
- Create: `algorithm-driven-ecommerce/docker-compose.yml`
- Create: `algorithm-driven-ecommerce/.env.example`
- Create: `algorithm-driven-ecommerce/package.json` (root)
- Create: `algorithm-driven-ecommerce/server/package.json`
- Create: `algorithm-driven-ecommerce/server/tsconfig.json`
- Create: `algorithm-driven-ecommerce/client/package.json`
- Create: `algorithm-driven-ecommerce/client/vite.config.ts`
- Create: `algorithm-driven-ecommerce/client/tsconfig.json`
- Create: `algorithm-driven-ecommerce/client/tailwind.config.ts`
- Create: `algorithm-driven-ecommerce/client/postcss.config.js`
- Create: `algorithm-driven-ecommerce/client/index.html`
- Create: `algorithm-driven-ecommerce/.gitignore`

**Interfaces:**
- Produces: runnable `npm run dev` from root that starts both client and server concurrently

- [ ] **Step 1:** Create `algorithm-driven-ecommerce/docker-compose.yml`
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ecomuser
      POSTGRES_PASSWORD: ecompass
      POSTGRES_DB: ecomdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
volumes:
  pgdata:
```

- [ ] **Step 2:** Create `.env.example`
```
DATABASE_URL="postgresql://ecomuser:ecompass@localhost:5432/ecomdb"
JWT_SECRET="butwal_ecom_jwt_secret_2024_bca_project"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
```

- [ ] **Step 3:** Create root `package.json`
```json
{
  "name": "algorithm-driven-ecommerce",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "build": "npm run build --prefix server && npm run build --prefix client",
    "seed": "npm run seed --prefix server",
    "migrate": "npm run migrate --prefix server",
    "test": "npm run test --prefix server"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 4:** Create `server/package.json` with all server deps:
  - dependencies: express, @prisma/client, bcryptjs, jsonwebtoken, cors, cookie-parser, dotenv, zod
  - devDependencies: typescript, ts-node, ts-node-dev, @types/express, @types/bcryptjs, @types/jsonwebtoken, @types/cors, @types/cookie-parser, @types/node, prisma, vitest, supertest, @types/supertest
  - scripts: `"dev": "ts-node-dev --respawn src/server.ts"`, `"build": "tsc"`, `"seed": "ts-node prisma/seed.ts"`, `"migrate": "prisma migrate dev"`, `"test": "vitest run"`

- [ ] **Step 5:** Create `server/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020", "module": "commonjs", "lib": ["ES2020"],
    "outDir": "dist", "rootDir": "src",
    "strict": true, "esModuleInterop": true, "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*", "prisma/**/*"]
}
```

- [ ] **Step 6:** Create `client/package.json` with:
  - dependencies: react, react-dom, react-router-dom, axios, lucide-react, recharts, react-leaflet, leaflet, react-hook-form, @hookform/resolvers, zod
  - devDependencies: @vitejs/plugin-react, typescript, vite, tailwindcss, postcss, autoprefixer, @types/react, @types/react-dom, @types/leaflet, vitest

- [ ] **Step 7:** Create `client/vite.config.ts`, `client/tsconfig.json`, `client/tailwind.config.ts`, `client/postcss.config.js`, `client/index.html`

- [ ] **Step 8:** Create `.gitignore` covering node_modules, dist, .env, pgdata

- [ ] **Step 9:** Install root deps: `npm install` from root
- [ ] **Step 10:** Install server deps: `npm install` from `server/`
- [ ] **Step 11:** Install client deps: `npm install` from `client/`
- [ ] **Step 12:** Commit: `git init && git add -A && git commit -m "chore: scaffold monorepo"`

---

## Task 2: Prisma Schema & Migrations

**Files:**
- Create: `server/prisma/schema.prisma`
- Create: `server/.env` (copy from .env.example)

**Interfaces:**
- Produces: 14 Prisma models available via `@prisma/client`; migration applied to local Postgres

- [ ] **Step 1:** Write `server/prisma/schema.prisma` with these 14 models:

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum Role { CUSTOMER ADMIN COURIER }
enum OrderStatus { PLACED PROCESSING SHIPPED OUT_FOR_DELIVERY DELIVERED CANCELLED }
enum PaymentMethod { COD ESEWA KHALTI FONEPAY }
enum PaymentStatus { PENDING PAID FAILED REFUNDED }
enum ProductStatus { ACTIVE INACTIVE OUT_OF_STOCK }
enum BatchStatus { PENDING ASSIGNED IN_TRANSIT COMPLETED }
enum DeliveryStatus { PENDING PICKED_UP OUT_FOR_DELIVERY DELIVERED FAILED }
enum NodeType { DEPOT INTERSECTION CUSTOMER_STOP }
enum InventoryType { SALE RESTOCK RETURN ADJUSTMENT }

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  phone     String?
  password  String
  role      Role     @default(CUSTOMER)
  address   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
  cart      Cart?
  batches   DeliveryBatch[]
  deliveries Delivery[]
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  products    Product[]
}

model Product {
  id                String               @id @default(cuid())
  name              String
  slug              String               @unique
  sku               String               @unique
  description       String
  price             Float
  discountPrice     Float?
  stockQuantity     Int                  @default(0)
  lowStockThreshold Int                  @default(5)
  status            ProductStatus        @default(ACTIVE)
  images            String[]
  brand             String?
  categoryId        String
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt
  category          Category             @relation(fields: [categoryId], references: [id])
  features          ProductFeature[]
  cartItems         CartItem[]
  orderItems        OrderItem[]
  inventoryTx       InventoryTransaction[]
}

model ProductFeature {
  id           String  @id @default(cuid())
  productId    String
  featureKey   String
  featureValue String
  weight       Float   @default(1.0)
  product      Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model InventoryTransaction {
  id               String        @id @default(cuid())
  productId        String
  changeAmount     Int
  type             InventoryType
  referenceOrderId String?
  createdAt        DateTime      @default(now())
  product          Product       @relation(fields: [productId], references: [id])
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  updatedAt DateTime   @updatedAt
  user      User       @relation(fields: [userId], references: [id])
  items     CartItem[]
}

model CartItem {
  id        String  @id @default(cuid())
  cartId    String
  productId String
  quantity  Int     @default(1)
  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  customerId      String
  totalAmount     Float
  deliveryCharge  Float       @default(50)
  paymentMethod   PaymentMethod @default(COD)
  paymentStatus   PaymentStatus @default(PENDING)
  orderStatus     OrderStatus @default(PLACED)
  deliveryAddress String
  deliveryPhone   String
  roadNodeId      String?
  latitude        Float?
  longitude       Float?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  customer        User        @relation(fields: [customerId], references: [id])
  roadNode        RoadNode?   @relation(fields: [roadNodeId], references: [id])
  items           OrderItem[]
  delivery        Delivery?
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  unitPrice Float
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])
}

model DeliveryBatch {
  id              String      @id @default(cuid())
  batchNumber     String      @unique
  status          BatchStatus @default(PENDING)
  courierId       String?
  totalDistanceKm Float?
  algorithmLog    Json?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  courier         User?       @relation(fields: [courierId], references: [id])
  deliveries      Delivery[]
  stops           DeliveryStop[]
}

model Delivery {
  id         String         @id @default(cuid())
  batchId    String
  orderId    String         @unique
  courierId  String?
  status     DeliveryStatus @default(PENDING)
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt
  batch      DeliveryBatch  @relation(fields: [batchId], references: [id])
  order      Order          @relation(fields: [orderId], references: [id])
  courier    User?          @relation(fields: [courierId], references: [id])
}

model DeliveryStop {
  id                  String        @id @default(cuid())
  batchId             String
  roadNodeId          String
  stopSequence        Int
  estimatedDistanceKm Float?
  isCompleted         Boolean       @default(false)
  batch               DeliveryBatch @relation(fields: [batchId], references: [id])
  roadNode            RoadNode      @relation(fields: [roadNodeId], references: [id])
}

model RoadNode {
  id        String       @id @default(cuid())
  name      String       @unique
  nodeType  NodeType     @default(INTERSECTION)
  latitude  Float
  longitude Float
  orders    Order[]
  stops     DeliveryStop[]
  edgesFrom RoadEdge[]   @relation("EdgeFrom")
  edgesTo   RoadEdge[]   @relation("EdgeTo")
}

model RoadEdge {
  id           String   @id @default(cuid())
  fromNodeId   String
  toNodeId     String
  distanceKm   Float
  bidirectional Boolean  @default(true)
  fromNode     RoadNode @relation("EdgeFrom", fields: [fromNodeId], references: [id])
  toNode       RoadNode @relation("EdgeTo", fields: [toNodeId], references: [id])
}
```

- [ ] **Step 2:** Copy `.env.example` to `server/.env`, fill real values
- [ ] **Step 3:** Run `npx prisma migrate dev --name init` from `server/`
- [ ] **Step 4:** Verify migration applied: `npx prisma studio` opens without error
- [ ] **Step 5:** Commit: `git add -A && git commit -m "feat: prisma schema 14 models + migration"`

---

## Task 3: Seed Data

**Files:**
- Create: `server/prisma/seed.ts`

**Interfaces:**
- Produces: DB populated with 3 users, 4 categories, 35+ products with ProductFeatures, 10 RoadNodes, 16 RoadEdges, 5 Orders

- [ ] **Step 1:** Write `server/prisma/seed.ts` — structure:
  1. Hash passwords with bcryptjs (rounds=10)
  2. Upsert 3 users (admin, courier, customer)
  3. Upsert 4 categories: Electronics, Fashion, Grocery, Home Essentials
  4. Upsert 10 RoadNodes (exact coordinates from design doc)
  5. Upsert 16 RoadEdges (bidirectional, km from design doc)
  6. Upsert 35+ products — each with at least 4 ProductFeature rows (category tag, brand tag, price_tier float, 1-2 spec tags)
  7. Create 5 sample Orders with OrderItems, each assigned to a different RoadNode
  
  Products must include (with NPR prices):
  - Electronics: Samsung Galaxy A54 (Rs. 52,000), Redmi Note 12 (Rs. 29,999), JBL Bluetooth Speaker (Rs. 8,500), laptop (Rs. 85,000-145,000), earbuds, power bank, smart TV
  - Fashion: Daura Suruwal (Rs. 2,500), saree, men's kurta, sneakers, jacket, t-shirts
  - Grocery: basmati rice 5kg, mustard oil 1L, dal, tea, sugar, noodles, biscuits
  - Home: pressure cooker, steel tiffin, fan, LED bulb, bedsheet, pillow, broom

- [ ] **Step 2:** Run `npm run seed` from root
- [ ] **Step 3:** Verify in Prisma Studio: products count ≥ 35, nodes = 10, edges ≥ 16
- [ ] **Step 4:** Commit: `git add -A && git commit -m "feat: seed data butwal road graph + 35 products"`

---

## Task 4: Algorithm Modules (Server)

**Files:**
- Create: `server/src/algorithms/levenshteinDistance.ts`
- Create: `server/src/algorithms/cosineSimilarity.ts`
- Create: `server/src/algorithms/dijkstra.ts`
- Create: `server/src/algorithms/nearestNeighbor.ts`
- Create: `server/src/algorithms/featureExtraction.ts`
- Create: `server/src/algorithms/__tests__/levenshtein.test.ts`
- Create: `server/src/algorithms/__tests__/cosine.test.ts`
- Create: `server/src/algorithms/__tests__/dijkstra.test.ts`
- Create: `server/src/algorithms/__tests__/nearestNeighbor.test.ts`

**Interfaces:**

`levenshteinDistance.ts` exports:
```ts
function computeLevenshtein(a: string, b: string): { distance: number; matrix: number[][] }
function searchWithTolerance(query: string, candidates: {id:string;name:string;tags:string[]}[], threshold?: number): SearchResult[]
// SearchResult: { id, name, distance, suggestion?: string }
```

`cosineSimilarity.ts` exports:
```ts
function buildVocabulary(products: ProductWithFeatures[]): string[]
function buildProductVector(product: ProductWithFeatures, vocabulary: string[]): number[]
function calculateCosineSimilarity(a: number[], b: number[]): number
function getRecommendationExplanation(vecA: number[], vecB: number[], vocabulary: string[]): ExplanationItem[]
// ExplanationItem: { dimension: string; aValue: number; bValue: number; product: number }
```

`dijkstra.ts` exports:
```ts
type Graph = Map<string, Array<{nodeId: string; distanceKm: number}>>
function buildAdjacencyList(nodes: RoadNode[], edges: RoadEdge[]): Graph
function dijkstra(graph: Graph, startNodeId: string): { distances: Map<string,number>; previous: Map<string,string|null>; steps: DijkstraStep[] }
// DijkstraStep: { iteration: number; extracted: string; distances: Record<string,number>; visited: string[] }
function reconstructPath(previous: Map<string,string|null>, targetId: string): string[]
function computeDistanceMatrix(graph: Graph, nodeIds: string[]): Map<string, Map<string,number>>
```

`nearestNeighbor.ts` exports:
```ts
function nearestNeighborTSP(depotId: string, stopIds: string[], distanceMatrix: Map<string,Map<string,number>>): TSPResult
// TSPResult: { orderedStops: string[]; totalDistanceKm: number; steps: TSPStep[]; naiveDistanceKm: number }
// TSPStep: { step: number; from: string; to: string; distanceKm: number; remaining: string[]; reason: string }
```

- [ ] **Step 1:** Write failing tests for `computeLevenshtein`:
  - `("", "")` → distance 0
  - `("", "abc")` → distance 3
  - `("kitten", "sitting")` → distance 3
  - `("laptop", "lapotp")` → distance 2
  - matrix dimensions = `(a.length+1) × (b.length+1)`

- [ ] **Step 2:** Run tests — expect FAIL
- [ ] **Step 3:** Implement `levenshteinDistance.ts` — standard DP, store full matrix, return both distance and matrix
- [ ] **Step 4:** Run tests — expect PASS
- [ ] **Step 5:** Write failing tests for `calculateCosineSimilarity`:
  - identical vectors → 1.0
  - orthogonal vectors → 0.0
  - zero vector → 0.0 (not NaN)
  - `([1,0,1], [1,0,1])` → 1.0
- [ ] **Step 6:** Run tests — expect FAIL
- [ ] **Step 7:** Implement `cosineSimilarity.ts` with guard: if `||A|| === 0 || ||B|| === 0` return 0
- [ ] **Step 8:** Run tests — expect PASS
- [ ] **Step 9:** Write failing tests for `dijkstra`:
  - 3-node linear graph: A→B 1km, B→C 2km; from A: dist[C]=3
  - disconnected node: dist = Infinity
  - reconstructPath returns `["A","B","C"]`
  - single node: dist[self]=0
- [ ] **Step 10:** Run tests — expect FAIL
- [ ] **Step 11:** Implement `dijkstra.ts` — adjacency list + hand-rolled min-heap (array-based, `heapifyUp`/`heapifyDown`), collect steps array
- [ ] **Step 12:** Run tests — expect PASS
- [ ] **Step 13:** Write failing tests for `nearestNeighborTSP`:
  - 3 stops with known distances → verify ordered sequence is greedy-correct
  - single stop → orderedStops = [depotId, stopId, depotId], totalDistance = 2×dist
  - naiveDistanceKm is computed by visiting stops in original order
- [ ] **Step 14:** Run tests — expect FAIL
- [ ] **Step 15:** Implement `nearestNeighbor.ts`
- [ ] **Step 16:** Run all tests: `npm test` from server — all PASS
- [ ] **Step 17:** Commit: `git add -A && git commit -m "feat: 4 algorithm modules with unit tests"`

---

## Task 5: Express Server & Middleware

**Files:**
- Create: `server/src/server.ts`
- Create: `server/src/config/db.ts`
- Create: `server/src/config/env.ts`
- Create: `server/src/middleware/authMiddleware.ts`
- Create: `server/src/middleware/roleGuard.ts`
- Create: `server/src/middleware/errorHandler.ts`
- Create: `server/src/middleware/validate.ts`

**Interfaces:**
- Produces: Express app on port 3000; `authenticateToken` middleware that reads JWT from `Authorization` header or `token` cookie; `requireRole(...roles)` guard; global error handler returning `{success:false, message, errors?}`

- [ ] **Step 1:** Write `server/src/config/env.ts` — read + validate all env vars, throw if missing
- [ ] **Step 2:** Write `server/src/config/db.ts` — export singleton PrismaClient
- [ ] **Step 3:** Write `server/src/middleware/authMiddleware.ts` — verify JWT, attach `req.user = {id, email, role}`
- [ ] **Step 4:** Write `server/src/middleware/roleGuard.ts` — `requireRole(Role.ADMIN)` etc.
- [ ] **Step 5:** Write `server/src/middleware/errorHandler.ts` — catch-all, log error, return 500 JSON
- [ ] **Step 6:** Write `server/src/middleware/validate.ts` — Zod schema validation middleware factory
- [ ] **Step 7:** Write `server/src/server.ts` — mount CORS (credentials + CLIENT_URL), cookie-parser, json body parser, routes, errorHandler
- [ ] **Step 8:** Run `npm run dev --prefix server` — expect "Server running on port 3000"
- [ ] **Step 9:** Commit: `git add -A && git commit -m "feat: express server + middleware"`

---

## Task 6: Auth API

**Files:**
- Create: `server/src/controllers/authController.ts`
- Create: `server/src/routes/authRoutes.ts`

**Interfaces:**
- Produces:
  - `POST /api/auth/register` → `{success, user: {id,name,email,role}}`
  - `POST /api/auth/login` → sets HTTP-only cookie `token`, returns `{success, user}`
  - `POST /api/auth/logout` → clears cookie
  - `GET /api/auth/me` → returns current user (requires auth)

- [ ] **Step 1:** Write `authController.ts` — register (hash password, create user), login (compare, sign JWT, set cookie maxAge=7d), logout (clearCookie), getMe
- [ ] **Step 2:** Write Zod schemas: `RegisterSchema` (name, email, Nepalese phone regex, password min 8), `LoginSchema`
- [ ] **Step 3:** Wire routes in `authRoutes.ts`
- [ ] **Step 4:** Mount at `/api/auth` in `server.ts`
- [ ] **Step 5:** Test with curl: register → login → /me
- [ ] **Step 6:** Commit: `git add -A && git commit -m "feat: auth API register/login/logout/me"`

---

## Task 7: Product & Category API

**Files:**
- Create: `server/src/controllers/productController.ts`
- Create: `server/src/routes/productRoutes.ts`

**Interfaces:**
- `GET /api/products` — query params: `search`, `categoryId`, `minPrice`, `maxPrice`, `inStock`, `page`, `limit`
- `GET /api/products/:id`
- `POST /api/products` (ADMIN) — create with features
- `PUT /api/products/:id` (ADMIN)
- `DELETE /api/products/:id` (ADMIN)
- `GET /api/categories`
- `GET /api/products/:id/recommendations` — returns top 4 similar products + explanation payload

- [ ] **Step 1:** Write `productController.ts`:
  - `listProducts`: build Prisma `where` from query params; include category
  - `getProduct`: include features, category
  - `createProduct`: admin only, create + features in transaction
  - `updateProduct`: admin only
  - `deleteProduct`: admin only
  - `getRecommendations`: fetch all products with features, build vocab, build vectors, sort by cosine similarity desc, return top 4 with explanation
- [ ] **Step 2:** Wire routes; protect write routes with `requireRole(ADMIN)`
- [ ] **Step 3:** Mount at `/api/products` and `/api/categories`
- [ ] **Step 4:** Verify `GET /api/products` returns seeded products
- [ ] **Step 5:** Verify `GET /api/products/:id/recommendations` returns 4 items with explanation array
- [ ] **Step 6:** Commit: `git add -A && git commit -m "feat: product & category API + cosine recommendations"`

---

## Task 8: Cart & Order API

**Files:**
- Create: `server/src/controllers/cartController.ts`
- Create: `server/src/controllers/orderController.ts`
- Create: `server/src/routes/cartRoutes.ts`
- Create: `server/src/routes/orderRoutes.ts`

**Interfaces:**
- Cart: `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/:itemId`, `DELETE /api/cart/items/:itemId`, `DELETE /api/cart` (clear)
- Orders:
  - `POST /api/orders` — checkout; Prisma transaction: verify stock → create order + items → decrement stock → log InventoryTransaction → clear cart
  - `GET /api/orders` — customer sees own orders; admin sees all
  - `GET /api/orders/:id`
  - `PUT /api/orders/:id/status` (ADMIN) — advance orderStatus
  - `GET /api/orders/admin/all` (ADMIN)

- [ ] **Step 1:** Write `cartController.ts` — get or create cart for user; add/update/remove items
- [ ] **Step 2:** Write `orderController.ts`:
  - `createOrder`: atomic Prisma transaction; generate `orderNumber` as `BW-YYYY-XXXXXX`; fail if any item stockQuantity < requested
  - `listOrders`: role-aware query
  - `updateOrderStatus`: admin only
- [ ] **Step 3:** Wire and mount routes; all cart/order routes require auth
- [ ] **Step 4:** Test checkout transaction: attempt to order more than stock → expect 400 error
- [ ] **Step 5:** Commit: `git add -A && git commit -m "feat: cart + order API with atomic stock transaction"`

---

## Task 9: Delivery & Algorithm API

**Files:**
- Create: `server/src/controllers/deliveryController.ts`
- Create: `server/src/controllers/algoController.ts`
- Create: `server/src/routes/deliveryRoutes.ts`
- Create: `server/src/routes/algoRoutes.ts`

**Interfaces:**
- Delivery (ADMIN):
  - `GET /api/delivery/nodes` — all RoadNodes
  - `GET /api/delivery/edges` — all RoadEdges
  - `POST /api/delivery/optimize` — body: `{orderIds: string[]}` → runs Dijkstra + NN → returns `{batch, sequence, totalDistanceKm, naiveDistanceKm, algorithmLog, steps}`
  - `POST /api/delivery/batches` — save batch + stops + deliveries
  - `GET /api/delivery/batches` — ADMIN/COURIER
  - `GET /api/delivery/batches/:id`
  - `PUT /api/delivery/batches/:id/assign` — assign courier (ADMIN)
  - `PUT /api/delivery/stops/:id/complete` — mark stop done (COURIER)
- Algorithm Lab (public, for viva):
  - `POST /api/algo/levenshtein` — body: `{a, b}` → returns `{distance, matrix}`
  - `POST /api/algo/cosine` — body: `{productIdA, productIdB}` → returns `{similarity, vecA, vecB, vocabulary, explanation}`
  - `POST /api/algo/dijkstra` — body: `{startNodeId, endNodeId}` → returns `{distance, path, steps, nodes, edges}`
  - `POST /api/algo/tsp` — body: `{stopNodeIds: string[]}` → returns `{result}` (TSPResult)
  - `GET /api/algo/search` — query: `?q=string` → runs levenshtein search over product names, returns matches + suggestion

- [ ] **Step 1:** Write `deliveryController.ts` — `optimizeRoute`: fetch orders' roadNodeIds, build graph, run Dijkstra matrix, run NN TSP, return full result
- [ ] **Step 2:** Write `algoController.ts` — thin wrappers calling algorithm modules; `searchProducts` combines DB query + levenshtein fallback
- [ ] **Step 3:** Wire and mount routes
- [ ] **Step 4:** Test `POST /api/algo/levenshtein` with `{"a":"kitten","b":"sitting"}` → `{distance:3}`
- [ ] **Step 5:** Test `POST /api/algo/dijkstra` with Traffic Chowk → Golpark → expect path + steps
- [ ] **Step 6:** Commit: `git add -A && git commit -m "feat: delivery route optimization + algo lab API"`

---

## Task 10: Client Foundation (Vite + Router + Auth)

**Files:**
- Create: `client/src/main.tsx`
- Create: `client/src/App.tsx`
- Create: `client/src/index.css`
- Create: `client/src/types/index.ts`
- Create: `client/src/services/api.ts`
- Create: `client/src/contexts/AuthContext.tsx`
- Create: `client/src/contexts/CartContext.tsx`
- Create: `client/src/hooks/useDebounce.ts`
- Create: `client/src/hooks/useAuth.ts`
- Create: `client/src/layouts/CustomerLayout.tsx`
- Create: `client/src/layouts/AdminLayout.tsx`
- Create: `client/src/layouts/CourierLayout.tsx`
- Create: `client/src/components/Navbar.tsx`
- Create: `client/src/components/Spinner.tsx`
- Create: `client/src/components/ProtectedRoute.tsx`

**Interfaces:**
- Produces: React app with routes structure; `useAuth()` hook returning `{user, login, logout, loading}`; `useCart()` hook returning `{items, addItem, removeItem, total}`; axios instance with `withCredentials: true` base URL `http://localhost:3000`

- [ ] **Step 1:** Write `client/src/types/index.ts` — TypeScript interfaces matching all 14 Prisma models (camelCase, using string for IDs, number for floats)
- [ ] **Step 2:** Write `client/src/services/api.ts` — axios instance; interceptor to redirect to /login on 401
- [ ] **Step 3:** Write `AuthContext.tsx` — on mount call `GET /api/auth/me`, expose user state
- [ ] **Step 4:** Write `CartContext.tsx` — syncs with `GET /api/cart` on auth; local add/remove optimistically
- [ ] **Step 5:** Write `useDebounce.ts` (300ms default), `useAuth.ts` (re-export context)
- [ ] **Step 6:** Write `ProtectedRoute.tsx` — redirects to /login if not authenticated or wrong role
- [ ] **Step 7:** Write Navbar with: logo "BuTwal E-Com", search bar (debounced), cart icon with item count, user menu
- [ ] **Step 8:** Write three layout components (CustomerLayout includes Navbar + Footer; AdminLayout has sidebar nav; CourierLayout has mobile-friendly header)
- [ ] **Step 9:** Write `App.tsx` with React Router v6 routes:
  - `/` → StorePage
  - `/product/:id` → ProductDetailPage
  - `/cart` → CartPage
  - `/checkout` → CheckoutPage (protected, CUSTOMER)
  - `/orders` → OrdersPage (protected, CUSTOMER)
  - `/orders/:id` → OrderDetailPage (protected, CUSTOMER)
  - `/login` → LoginPage
  - `/register` → RegisterPage
  - `/admin` → AdminDashboard (protected, ADMIN)
  - `/admin/products` → AdminProductsPage (protected, ADMIN)
  - `/admin/delivery` → AdminDeliveryPage (protected, ADMIN)
  - `/admin/orders` → AdminOrdersPage (protected, ADMIN)
  - `/courier` → CourierDashboard (protected, COURIER)
  - `/algo-lab` → AlgoLabPage (public)
- [ ] **Step 10:** Run `npm run dev` — verify app loads at :5173 without errors
- [ ] **Step 11:** Commit: `git add -A && git commit -m "feat: client foundation routing + auth + cart context"`

---

## Task 11: Customer Storefront Pages

**Files:**
- Create: `client/src/pages/StorePage.tsx`
- Create: `client/src/pages/ProductDetailPage.tsx`
- Create: `client/src/pages/CartPage.tsx`
- Create: `client/src/pages/CheckoutPage.tsx`
- Create: `client/src/pages/OrdersPage.tsx`
- Create: `client/src/pages/OrderDetailPage.tsx`
- Create: `client/src/pages/LoginPage.tsx`
- Create: `client/src/pages/RegisterPage.tsx`
- Create: `client/src/components/ProductCard.tsx`
- Create: `client/src/components/RecommendationModal.tsx`
- Create: `client/src/components/PaymentModal.tsx`
- Create: `client/src/components/DeliveryMap.tsx`
- Create: `client/src/components/OrderStatusBar.tsx`

**Interfaces:**
- Produces: fully functional customer journey from browse → cart → checkout → track order

- [ ] **Step 1:** Write `ProductCard.tsx` — image, name, price in `Rs. X,XXX` format, discount badge, "Add to Cart" button, stock badge
- [ ] **Step 2:** Write `StorePage.tsx`:
  - category filter pills
  - price range sliders (NPR scale)
  - debounced search input hitting `GET /api/algo/search?q=`
  - product grid with ProductCard
  - "Did you mean X?" banner when API returns suggestion
- [ ] **Step 3:** Write `ProductDetailPage.tsx`:
  - product images carousel
  - price in NPR, discount crossed out
  - Add to cart with quantity selector
  - "Similar Products" section: 4 cards
  - "Why recommended?" button → opens RecommendationModal
- [ ] **Step 4:** Write `RecommendationModal.tsx` — shows two product names, similarity score (%), vector dimension breakdown table with colored bars
- [ ] **Step 5:** Write `DeliveryMap.tsx` — React-Leaflet map centered on Butwal (27.7006, 83.4484), zoom 14; shows 10 node markers; click = select delivery node; pin drag supported
- [ ] **Step 6:** Write `CheckoutPage.tsx`:
  - delivery address form (React Hook Form + Zod: name, phone with Nepalese regex, address text)
  - DeliveryMap for node selection
  - payment method selector: COD / eSewa / Khalti / Fonepay
  - on non-COD selection → open PaymentModal
  - submit → `POST /api/orders`
- [ ] **Step 7:** Write `PaymentModal.tsx` — styled like eSewa/Khalti (green/purple theme), fake phone input, "Pay Rs. X,XXX" button that waits 1.5s and shows "✓ Payment Successful! Ref: TXN-XXXXXXXX"
- [ ] **Step 8:** Write `CartPage.tsx` — item list, quantity controls, subtotal in NPR, delivery charge Rs. 50, total, "Proceed to Checkout" button
- [ ] **Step 9:** Write `OrdersPage.tsx` — table of customer orders with status badges
- [ ] **Step 10:** Write `OrderDetailPage.tsx` with `OrderStatusBar.tsx` — 5-step progress bar (Placed→Processing→Shipped→Out for Delivery→Delivered), order items table, delivery address
- [ ] **Step 11:** Write `LoginPage.tsx` and `RegisterPage.tsx` using React Hook Form + Zod
- [ ] **Step 12:** Verify full customer flow: register → browse → add to cart → checkout COD → see order status
- [ ] **Step 13:** Commit: `git add -A && git commit -m "feat: customer storefront pages complete"`

---

## Task 12: Admin Dashboard Pages

**Files:**
- Create: `client/src/pages/admin/AdminDashboard.tsx`
- Create: `client/src/pages/admin/AdminProductsPage.tsx`
- Create: `client/src/pages/admin/AdminDeliveryPage.tsx`
- Create: `client/src/pages/admin/AdminOrdersPage.tsx`
- Create: `client/src/components/admin/StatsCard.tsx`
- Create: `client/src/components/admin/ProductForm.tsx`
- Create: `client/src/components/admin/RouteOptimizationPanel.tsx`
- Create: `client/src/components/admin/BatchMap.tsx`

**Interfaces:**
- Produces: admin can view analytics, CRUD products, run route optimization, assign courier

- [ ] **Step 1:** Write `AdminDashboard.tsx`:
  - 4 StatsCards: Total Revenue (NPR), Total Orders, Low Stock Alerts, Active Products
  - Recharts BarChart: orders per day (last 7 days)
  - Recharts PieChart: orders by category
- [ ] **Step 2:** Write `AdminProductsPage.tsx` — data table with search, edit/delete buttons, "Add Product" opens ProductForm modal
- [ ] **Step 3:** Write `ProductForm.tsx` — React Hook Form for all product fields; stock quantity; feature tags (key-value pairs, add/remove rows)
- [ ] **Step 4:** Write `AdminOrdersPage.tsx` — table with order status dropdown to advance status; payment status badge
- [ ] **Step 5:** Write `RouteOptimizationPanel.tsx`:
  - list of PLACED/PROCESSING orders with checkboxes
  - "Optimize Route" button → `POST /api/delivery/optimize`
  - results panel: before/after km comparison (e.g., "Naive: 18.4 km → Optimized: 12.1 km")
  - step-by-step TSP decision log displayed as ordered list
  - "Save & Assign Courier" dropdown → `POST /api/delivery/batches`
- [ ] **Step 6:** Write `BatchMap.tsx` — Leaflet map showing numbered stop pins in optimized sequence, connected by polylines
- [ ] **Step 7:** Write `AdminDeliveryPage.tsx` — combines RouteOptimizationPanel + BatchMap + list of saved batches
- [ ] **Step 8:** Verify: login as admin → run optimization → see km reduction → save batch
- [ ] **Step 9:** Commit: `git add -A && git commit -m "feat: admin dashboard + delivery optimization UI"`

---

## Task 13: Courier Dashboard

**Files:**
- Create: `client/src/pages/courier/CourierDashboard.tsx`
- Create: `client/src/pages/courier/BatchDetailPage.tsx`
- Create: `client/src/components/courier/StopCard.tsx`

**Interfaces:**
- Produces: courier sees assigned batches; can mark stops complete; map shows route

- [ ] **Step 1:** Write `CourierDashboard.tsx` — list of assigned batches with status badge, batch number, total km
- [ ] **Step 2:** Write `BatchDetailPage.tsx`:
  - Leaflet map with numbered route pins and polyline
  - ordered stop list below the map
  - each stop: neighborhood name, order number, customer address, status toggle
- [ ] **Step 3:** Write `StopCard.tsx` — stop number, location name, order info, action buttons: "Mark Picked Up" → "Out for Delivery" → "Mark Delivered" / "Failed"
- [ ] **Step 4:** Verify: login as courier → see assigned batch → mark stops in sequence
- [ ] **Step 5:** Commit: `git add -A && git commit -m "feat: courier dashboard + stop management"`

---

## Task 14: Algorithm Lab (Viva Demo Page)

**Files:**
- Create: `client/src/pages/AlgoLabPage.tsx`
- Create: `client/src/components/lab/LevenshteinLab.tsx`
- Create: `client/src/components/lab/CosineLab.tsx`
- Create: `client/src/components/lab/DijkstraLab.tsx`
- Create: `client/src/components/lab/TSPLab.tsx`
- Create: `client/src/algorithms/animationHelpers.ts`

**Interfaces:**
- Produces: `/algo-lab` page with 4 tabs; each tab has inputs, animated step-through (600ms interval, pause/resume/step-forward controls), and visual output

- [ ] **Step 1:** Write `AlgoLabPage.tsx` — tab switcher with 4 tabs; active tab renders its Lab component; header "Algorithm Laboratory — BCA Final Year Project"

- [ ] **Step 2:** Write `LevenshteinLab.tsx`:
  - Two text inputs (String A, String B)
  - "Compute" button → `POST /api/algo/levenshtein`
  - Render DP matrix as HTML `<table>` — row headers = chars of A, col headers = chars of B
  - Animate: highlight cells in fill order at 600ms intervals using `useEffect` + `setInterval`
  - Backtrack path highlighted in amber; min edit path shown
  - Display: `Edit Distance: N`, formula explanation below

- [ ] **Step 3:** Write `CosineLab.tsx`:
  - Two product dropdowns (fetch from `GET /api/products`)
  - "Compare" button → `POST /api/algo/cosine`
  - Show: similarity percentage, two side-by-side vector arrays as bar charts (Recharts), dimension table with matching cells highlighted
  - Formula display: `cos(θ) = A·B / (‖A‖ × ‖B‖)` with computed values substituted

- [ ] **Step 4:** Write `DijkstraLab.tsx`:
  - Source node + target node dropdowns (10 Butwal nodes)
  - Leaflet map showing all 10 nodes as circle markers with names
  - "Run Dijkstra" → `POST /api/algo/dijkstra`
  - Animate steps: at each step, highlight extracted node (red), update distances table (animate row change), color visited nodes green
  - After animation: highlight shortest path in blue polyline on map
  - Priority queue state shown as sorted list panel

- [ ] **Step 5:** Write `TSPLab.tsx`:
  - Multi-select of delivery stop nodes (checkboxes or multi-select, 3–8 stops)
  - Depot fixed at Traffic Chowk
  - "Run Nearest Neighbor" → `POST /api/algo/tsp`
  - Animate: draw route pin by pin on Leaflet map, show decision log panel ("Step 1: At Traffic Chowk, closest unvisited is Milanchowk (1.2 km)")
  - Final: total km displayed, comparison with naive order

- [ ] **Step 6:** Write `animationHelpers.ts` — `useStepAnimation(steps, intervalMs, onStep)` hook that returns `{play, pause, stepForward, reset, currentStep, isPlaying}`

- [ ] **Step 7:** Verify all 4 labs with the seed data; Levenshtein lab with "lapotp" / "laptop" shows distance=2; Dijkstra from Traffic Chowk to Golpark shows 1.8km path

- [ ] **Step 8:** Commit: `git add -A && git commit -m "feat: algorithm lab viva demo page all 4 algorithms"`

---

## Task 15: Integration, Polish & README

**Files:**
- Modify: various — fix any broken API connections found during full end-to-end test
- Create: `algorithm-driven-ecommerce/README.md`
- Create: `algorithm-driven-ecommerce/docs/ERD.md`

**Interfaces:**
- Produces: fully working end-to-end application; examiner can run with 3 commands

- [ ] **Step 1:** Full end-to-end smoke test:
  1. `docker compose up -d`
  2. `npm run migrate` from root
  3. `npm run seed` from root
  4. `npm run dev` from root
  5. Open http://localhost:5173 — homepage loads with products
  6. Login as customer → add to cart → checkout → see order
  7. Login as admin → run delivery optimization → save batch → assign courier
  8. Login as courier → see batch → mark stop complete
  9. Open /algo-lab → all 4 tabs animate correctly

- [ ] **Step 2:** Fix any CORS, auth cookie, or Leaflet SSR issues found

- [ ] **Step 3:** Add NPR formatting utility `formatNPR(amount: number): string` → `"Rs. 4,500"` and apply everywhere prices appear

- [ ] **Step 4:** Ensure all pages are responsive down to 375px width (mobile viva demo on phone is a bonus)

- [ ] **Step 5:** Write `README.md`:
  ```markdown
  # Algorithm-Driven E-Commerce Platform
  ## Butwal, Lumbini Province, Nepal — BCA Final Year Project
  
  ### Prerequisites
  - Node.js ≥ 18
  - Docker Desktop
  
  ### Quick Start (3 commands)
  ```bash
  docker compose up -d        # Start PostgreSQL
  npm install && npm run migrate && npm run seed  # Setup DB
  npm run dev                 # Start client + server
  ```
  Open http://localhost:5173
  
  ### Demo Accounts
  | Role | Email | Password |
  |------|-------|----------|
  | Admin | admin@butwalecom.com | Admin@123 |
  | Courier | courier@butwalecom.com | Courier@123 |
  | Customer | customer@gmail.com | Customer@123 |
  
  ### Algorithm Lab
  Visit http://localhost:5173/algo-lab for the interactive viva demonstration.
  ```

- [ ] **Step 6:** Write `docs/ERD.md` with Mermaid ERD diagram of all 14 models

- [ ] **Step 7:** Final commit: `git add -A && git commit -m "feat: complete algorithm-driven ecommerce platform v1.0"`
