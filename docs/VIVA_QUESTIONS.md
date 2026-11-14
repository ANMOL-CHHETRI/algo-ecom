# BCA Final Year Viva Examination — Questions & Answers Guide

This guide prepares you for questions external examiners frequently ask regarding the four algorithms and system architecture implemented in this project.

---

## 1. Content-Based Recommendation (Cosine Similarity)

### Q: Why did you choose Cosine Similarity instead of Euclidean Distance?
**Answer:** Euclidean distance is sensitive to vector magnitude (e.g., if one product has many tags and another has few, Euclidean distance will consider them far apart even if their relative features are identical). Cosine similarity measures the **angle** between the two vectors rather than their spatial distance, meaning it compares relative proportions of attributes rather than raw frequency.

### Q: What is the formula and time complexity?
**Answer:**
$$\text{Cosine Similarity}(A, B) = \frac{A \cdot B}{\|A\| \times \|B\|} = \frac{\sum_{i=1}^n A_i B_i}{\sqrt{\sum_{i=1}^n A_i^2} \times \sqrt{\sum_{i=1}^n B_i^2}}$$
- Building vocabulary: $O(N \times F)$ where $N$ is product count and $F$ is features per product.
- Pairwise comparison: $O(V)$ where $V$ is vocabulary length.
- Top-K recommendations: $O(N \times V + N \log K)$.

---

## 2. Shortest-Path Routing (Dijkstra's Algorithm)

### Q: Why use a Priority Queue (Min-Heap) instead of an array?
**Answer:** Without a min-heap, finding the unvisited node with minimum distance requires scanning all vertices ($O(V)$), leading to an overall time complexity of $O(V^2)$. With a binary min-heap, extraction takes $O(\log V)$ and edge relaxation takes $O(E \log V)$, resulting in an optimized complexity of $O((V + E) \log V)$, which is critical for scaling graph networks.

### Q: Can Dijkstra handle negative edge weights?
**Answer:** No. Dijkstra assumes that adding an edge to a path always increases or maintains the total distance. If negative weights exist, Bellman-Ford must be used instead. For road networks (like Butwal road distances in km), distances are always strictly positive, making Dijkstra optimal.

---

## 3. Delivery Sequencing (Nearest-Neighbor TSP)

### Q: What problem does the Nearest-Neighbor algorithm solve?
**Answer:** It solves the Traveling Salesperson Problem (TSP) for delivery couriers: visiting a set of customer drop-off points in Butwal starting and ending at the Central Depot (Traffic Chowk) with minimum total travel distance.

### Q: Why not compute the exact optimal TSP solution?
**Answer:** Exact TSP is an NP-hard problem ($O(N!)$ brute-force or $O(N^2 \cdot 2^N)$ using Held-Karp dynamic programming). For delivery logistics, computing exact solutions for dozens of stops in real-time is computationally prohibitive. The Nearest-Neighbor greedy heuristic runs in $O(N^2)$ using the precomputed Dijkstra distance matrix and produces high-quality approximations quickly (saving ~25-40% distance over arbitrary sequencing).

---

## 4. Typo-Tolerant Search (Levenshtein Distance)

### Q: How does the dynamic programming matrix work?
**Answer:** A 2D table `D[i][j]` is constructed where `i` represents the prefix of String A and `j` represents the prefix of String B.
- Base cases: `D[i][0] = i` (deletions) and `D[0][j] = j` (insertions).
- Recurrence: If characters match, `D[i][j] = D[i-1][j-1]`. If not, `D[i][j] = 1 + min(D[i-1][j], D[i][j-1], D[i-1][j-1])`.
- The bottom-right cell `D[m][n]` yields the minimum edit distance in $O(m \times n)$ time and space.
- Threshold $\le 2$ allows catching common keyboard typos (e.g., "lapotp" $\to$ "laptop").

---

## 5. System Architecture & Concurrency

### Q: How do you prevent two customers from buying the last item of inventory at the same time?
**Answer:** We wrap the checkout stock validation, order creation, and stock decrement inside an **atomic Prisma transaction** (`prisma.$transaction(async (tx) => { ... })`). In PostgreSQL, row-level locking ensures that concurrent transactions either succeed sequentially or throw an insufficient stock error if inventory hits zero.
