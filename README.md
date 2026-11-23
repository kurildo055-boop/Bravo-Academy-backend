# Bravo Academy — Backend API Server
### Official Armed Forces ISSB Preparation Platform
**ARMY · NAVY · AIR FORCE**

This is the dedicated backend REST API server for Bravo Academy, powered by Express, TypeScript, Prisma ORM, and Supabase PostgreSQL.

---

## 🛠 Tech Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js & TypeScript
- **Database**: PostgreSQL (Hosted on Supabase)
- **ORM**: Prisma ORM
- **Security & Auth**: Argon2 / Bcrypt password hashing + JWT Authentication
- **Payments**: bKash Tokenized Checkout & Nagad DFS Sandbox/Live Adapters

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` contains the Supabase PostgreSQL connection string with URL-encoded special characters (`#` -> `%23`, `+` -> `%2B`).

### 3. Generate Prisma Client & Run Database
```bash
npx prisma generate
```

### 4. Seed Essential Production Data (Optional)
```bash
npm run db:seed
```
Seeds Command HQ Admin, Cadet account, 7 defense courses, and 1,055 IQ questions.

### 5. Start Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5000`.

---

## 📡 API Endpoints

- `GET  /api/health` — Service status check
- `POST /api/auth/register` — Student account registration
- `POST /api/auth/login` — Cadet / Admin authentication
- `GET  /api/auth/me` — Current authenticated user profile
- `POST /api/auth/logout` — Session termination
- `GET  /api/courses` — List all published courses
- `POST /api/courses` — [Admin] Create new course
- `GET  /api/courses/:id` — Course details by ID or slug
- `GET  /api/questions` — Paginated defense question bank (1,055 questions)
- `POST /api/questions` — [Admin] Add custom question
- `POST /api/questions/ai-generate` — [Admin] Generate military IQ drills
- `POST /api/questions/paste-import` — [Admin] Bulk text parser
- `POST /api/exam/submit` — Timed test submission & real-time evaluation
- `POST /api/payments/initiate` — Create bKash/Nagad payment invoice
- `POST /api/payments/verify` — Verify transaction & activate course enrollment
- `GET  /api/admin/stats` — [Admin] Command overview & revenue statistics
- `GET  /api/admin/cms` — Homepage CMS configuration
- `PUT  /api/admin/cms` — [Admin] Update hero banner and announcements
- `GET  /api/home` — Aggregated homepage data
- `POST /api/ai/evaluate` — AI Officer-Like Qualities (OLQ) psychological scoring
