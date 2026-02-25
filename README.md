# Smart Disaster Response & Relief Coordination Platform

A centralized emergency help & rescue management system built with the MERN stack following MVC architecture.

---

## Project Structure

```
disaster-platform/
├── client/                   # React frontend (Vite)
│   └── src/
│       ├── context/          # AuthContext (global user state)
│       ├── pages/            # One folder per role
│       │   ├── auth/
│       │   ├── victim/
│       │   ├── volunteer/
│       │   ├── ngo/
│       │   └── admin/
│       ├── services/         # api.js (Axios instance)
│       └── App.jsx           # Routes + role-based protection
│
└── server/                   # Express backend
    ├── config/               # db.js, mailer.js
    ├── controllers/          # Business logic (one file per feature group)
    ├── middleware/           # auth.js (JWT + RBAC), upload.js (Multer)
    ├── models/               # Mongoose schemas
    └── routes/               # Express routers
```

---

## Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | React 18, React Router 6, Recharts, React-Leaflet |
| Backend    | Node.js, Express 4                  |
| Database   | MongoDB Atlas (Mongoose 8)           |
| Auth       | JWT (jsonwebtoken), bcryptjs         |
| Email      | Nodemailer                           |
| Maps       | Leaflet.js + OpenStreetMap (free)    |
| File Upload| Multer                               |

---

## Getting Started

### Prerequisites
- Node.js v18+
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account

### 1. Clone the repo
```bash
git clone <repo-url>
cd disaster-platform
```

### 2. Set up the server
```bash
cd server
npm install
cp .env.example .env
# Fill in your MONGO_URI, JWT_SECRET, and email credentials in .env
npm run dev
```

### 3. Set up the client
```bash
cd client
npm install
npm run dev
```

Server runs on `http://localhost:5000`  
Client runs on `http://localhost:5173`

---

## API Overview

| Base Route          | Description                     | Access         |
|---------------------|---------------------------------|----------------|
| `/api/auth`         | Register, login, password reset | Public/Private |
| `/api/sos`          | SOS requests + media upload     | Victim, Admin  |
| `/api/tasks`        | Volunteer task management        | Volunteer      |
| `/api/inventory`    | NGO inventory CRUD              | NGO            |
| `/api/camps`        | Relief camp management          | NGO, Admin     |
| `/api/distribution` | Aid distribution records        | NGO, Admin     |
| `/api/notifications`| Broadcast notifications         | All / Admin    |
| `/api/incidents`    | Incident archive                | Admin          |
| `/api/analytics`    | Dashboard stats & reports       | Admin          |

---

## User Roles

| Role      | Primary Capabilities                             |
|-----------|--------------------------------------------------|
| victim    | Create SOS, upload media, track rescue status    |
| volunteer | View map, accept/reject tasks, update status     |
| ngo       | Manage inventory, camps, volunteers, distribution|
| admin     | Full access, analytics, broadcast, incidents     |

---

## Team Task Distribution

| Member   | Easy Features                        | Medium Features                     | Hard Feature                     |
|----------|--------------------------------------|-------------------------------------|----------------------------------|
| Member 1 | SOS request, Request specific needs  | Accept/Reject tasks, Task status    | Smart allocation (`$near`)       |
| Member 2 | Upload media, View request status    | Nearby map view, Distribution tracking | Live tracking (polling)       |
| Member 3 | Inventory CRUD, Create camps         | Volunteer assignment, Shortage alerts | Analytics dashboard (4 charts)|
| Member 4 | Volunteer task list, Incident history| Priority tagging, Basic reports     | Emergency broadcast (email)      |

---

## Sprint Plan

| Sprint | Days  | Focus                                                           |
|--------|-------|-----------------------------------------------------------------|
| 1      | 1–10  | Auth setup + 1 easy feature each                               |
| 2      | 11–20 | 2 medium features each                                         |
| 3      | 21–30 | Hard features + second easy feature                            |
| 4      | 31–40 | Integration, testing, UI polish, demo prep                     |
