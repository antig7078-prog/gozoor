<p align="center">
  <img src="public/favicon.svg" width="80" alt="Gozoor Logo" />
</p>

<h1 align="center">🌱 جذور — Gozoor</h1>

<p align="center">
  <strong>المنظومة الزراعية المتكاملة — The Integrated Agricultural Ecosystem</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#database-schema">Database</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## 📋 Overview

**Gozoor (جذور)** is a full-featured, RTL Arabic-first web platform for the agricultural sector. It provides an integrated ecosystem combining e-learning, a marketplace for agricultural products, freelance services, a jobs board, and a community forum — all designed to empower farmers, agricultural professionals, and enthusiasts.

The name "جذور" means "Roots" in Arabic, symbolizing the platform's mission to build strong foundations for agricultural knowledge and community.

---

## ✨ Features

### 🎓 E-Learning System
- **Course Catalog** — Browse, search, and filter published courses by category and level
- **Course Player** — Video-based lecture player with section/chapter navigation
- **Enrollment & Payment** — Enroll in free or paid courses with payment-proof upload
- **Progress Tracking** — Track completed lectures and overall course completion percentage
- **Certificate Requests** — Request certificates after completing courses
- **Learning Paths** — Curated multi-course sequences
- **Workshops** — Browse available workshops and training events
- **Favorites** — Save favorite courses for later access

### 🛒 Marketplace
- **Product Listings** — Browse agricultural products with search and filtering
- **Seller Dashboard** — Users can list and manage their own products
- **Shopping Cart** — Persistent cart powered by Zustand with local storage
- **Checkout Flow** — Address, contact, and payment-proof based checkout
- **Order Tracking** — Track purchase and sale orders
- **Merchant Orders** — Sellers manage and update incoming customer orders

### 💼 Jobs Board
- **Job Listings** — Browse open positions with details (type, salary, location)
- **Job Applications** — Apply to jobs with resume upload and cover letter
- **My Applications** — Track application status (Pending, Reviewed, Accepted, Rejected)

### 🔧 Freelance Services
- **Service Listings** — Browse freelance agricultural services
- **Service Providers** — Users can list and manage their own services
- **Service Details** — Pricing, delivery time, and descriptions

### 👥 Community Forum
- **Posts & Feed** — Create text and image posts
- **Likes & Comments** — Engage with posts through likes and nested comments
- **Post Reporting** — Report inappropriate content
- **Moderation** — Admin tools for reviewing and managing reports

### 🏗️ Admin Dashboard
- **Dashboard Analytics** — Key metrics (users, enrollments, courses, revenue)
- **User Management** — View, search, and manage user roles
- **Course Management** — Full CRUD for courses, sections, and lectures
- **Enrollment Management** — Approve, reject, or review enrollment requests
- **Certificate Management** — Process and approve certificate requests
- **Category Management** — CRUD for course categories
- **Order Management** — Review and manage marketplace orders
- **Product/Service/Job Moderation** — Manage all user-generated listings
- **Community Moderation** — Handle reported posts and content
- **Learning Paths Management** — Create and manage learning paths
- **Settings** — Admin configuration panel

### 🛡️ Authentication & Authorization
- **Email/Password Auth** — Supabase Auth with email confirmation
- **Password Recovery** — Reset password flow via email
- **Role-Based Access** — User and Admin roles with protected routes
- **Auto Profile Creation** — Trigger-based profile creation on signup

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React | 19.2 |
| **Language** | TypeScript | 6.0 |
| **Build Tool** | Vite | 8.0 |
| **Styling** | Tailwind CSS | 4.2 |
| **Routing** | React Router DOM | 7.14 |
| **State Management** | Zustand | 5.0 |
| **Animations** | Framer Motion | 12.38 |
| **Icons** | Lucide React | 1.8 |
| **Notifications** | React Hot Toast | 2.6 |
| **Backend/BaaS** | Supabase | 2.103 |
| **Database** | PostgreSQL (via Supabase) | — |
| **Deployment** | GitHub Pages | — |
| **Typography** | Cairo (self-hosted) | Variable |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A [Supabase](https://supabase.com) project

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/gozoor.git
cd gozoor

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ **Important**: Never commit real credentials. The `.env.example` file should only contain placeholder values.

### Database Setup

1. Go to your Supabase project SQL Editor
2. Execute the full schema from [`supabase_schema.sql`](./supabase_schema.sql)
3. This creates all tables, functions, triggers, RLS policies, and storage buckets

### Running Locally

```bash
# Development server
npm run dev

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

The app runs at `http://localhost:5173/gozoor/` (note the `/gozoor/` base path).

---

## 📁 Project Structure

```
gozoor/
├── public/
│   ├── assets/
│   │   ├── fonts/          # Self-hosted Cairo font (Arabic + Latin)
│   │   └── images/         # Static images
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/             # Source images (hero, team, landing)
│   ├── components/
│   │   ├── layouts/        # AdminLayout, UserLayout, PublicBrowseLayout, ProtectedRoute
│   │   ├── shared/         # Reusable: Card, LoadingSpinner, ErrorBoundary, ImageUpload, etc.
│   │   └── ui/             # Atomic UI: Button, Input, Badge, Loader
│   ├── contexts/
│   │   └── AuthContext.tsx  # Supabase Auth context with role management
│   ├── hooks/
│   │   └── useRequireAuth.ts # Auth guard hook with redirect
│   ├── lib/
│   │   ├── store/
│   │   │   └── cartStore.ts # Zustand cart store with persistence
│   │   └── supabase.ts     # Supabase client + signed URL helpers
│   ├── pages/
│   │   ├── admin/          # 15 admin pages (dashboard, courses, users, etc.)
│   │   ├── public/         # Landing, Login, Signup, ForgotPassword, Static pages
│   │   └── user/           # User pages + sub-modules:
│   │       ├── careers/    # Careers and freelance products
│   │       ├── community/  # Community forum
│   │       ├── jobs/       # Job listings, details, applications
│   │       ├── learning-paths/  # Learning path browsing
│   │       ├── marketplace/     # Products, cart, checkout, orders
│   │       ├── services/   # Freelance services
│   │       └── workshops/  # Workshop listing
│   ├── services/           # Data access layer (8 service modules)
│   │   ├── communityService.ts
│   │   ├── courseService.ts
│   │   ├── enrollmentService.ts
│   │   ├── jobsService.ts
│   │   ├── marketplaceService.ts
│   │   ├── storageService.ts
│   │   ├── userService.ts
│   │   └── workshopService.ts
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   ├── utils/
│   │   └── error.ts        # Error sanitization + Arabic localization
│   ├── App.tsx             # Root router with lazy-loaded routes
│   ├── index.css           # Design tokens, theme, and global styles
│   └── main.tsx            # React DOM entry point
├── docs/plans/             # Planning documents (empty)
├── supabase_schema.sql     # Full database schema with RLS
├── .env.example            # Environment template
├── vite.config.ts          # Vite + React + Tailwind config
├── eslint.config.js        # ESLint flat config
├── tsconfig.json           # TypeScript config
└── package.json
```

---

## 🏛️ Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────────────┐
│                    App.tsx                       │
│           (BrowserRouter + Routes)              │
├─────────────┬───────────────┬───────────────────┤
│  Public     │  User Layout  │   Admin Layout    │
│  Routes     │  (Protected)  │   (Protected)     │
├─────────────┴───────────────┴───────────────────┤
│                  Pages Layer                     │
│     (Lazy-loaded components per route)          │
├─────────────────────────────────────────────────┤
│              Services Layer                      │
│   (Data access: Supabase queries + RPCs)        │
├─────────────────────────────────────────────────┤
│    Contexts      │    Stores     │    Hooks     │
│  (AuthContext)   │  (CartStore)  │  (useReqAuth)│
├─────────────────────────────────────────────────┤
│              Supabase Client                     │
│        (Auth, Database, Storage)                │
└─────────────────────────────────────────────────┘
```

### Key Patterns
- **Lazy Loading** — All page components are lazy-loaded with React Suspense
- **Service Layer** — Centralized data access through service modules
- **Error Localization** — All Supabase/DB errors are translated to Arabic
- **Role-Based Routing** — `ProtectedRoute` component guards user/admin areas
- **Persistent Cart** — Zustand store with `persist` middleware for localStorage
- **RTL-First Design** — Arabic-first with Tailwind CSS custom theme

### Database Architecture (Supabase)
- **20+ tables** across 7 domains (Users, E-Learning, Marketplace, Jobs, Community, Favorites/Reviews, Storage)
- **Row-Level Security (RLS)** on all tables
- **Database triggers** for auto-updating timestamps and profile creation
- **4 storage buckets** (uploads, payment-proofs, certificates, course-content) with access policies
- **Server-side functions** (RPC) for atomic like/comment count operations

---

## 🗄️ Database Schema

See [`supabase_schema.sql`](./supabase_schema.sql) for the complete schema. Key domains:

| Domain | Tables |
|--------|--------|
| **Users** | `profiles` |
| **E-Learning** | `categories`, `courses`, `course_sections`, `course_lectures`, `enrollments`, `user_progress`, `certificate_requests`, `learning_paths`, `learning_path_courses`, `workshops` |
| **Marketplace** | `products`, `services`, `orders`, `order_items` |
| **Jobs** | `jobs`, `job_applications` |
| **Community** | `posts`, `post_likes`, `post_comments`, `post_reports` |
| **Shared** | `favorites`, `reviews` |

---

## 🚢 Deployment

The project is configured for GitHub Pages deployment:

```bash
# Build and deploy
npm run deploy
```

This runs `vite build` then publishes the `dist/` folder via `gh-pages`. The app uses `/gozoor/` as the base path.

### Deployment Checklist
- [ ] Set correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in build environment
- [ ] Ensure Supabase project has all RLS policies applied
- [ ] Verify storage buckets are created
- [ ] Test admin user setup and role assignment

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

<p align="center">
  Built with ❤️ for the agricultural community<br/>
  <strong>جذور — مِن الجذور… نبني المستقبل الزراعي</strong>
</p>