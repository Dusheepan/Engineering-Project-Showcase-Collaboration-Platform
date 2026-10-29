# ⚙️ Engineering Showcase — MERN Stack Application

A full-stack MERN (MongoDB, Express, React, Node.js) web application designed for students and faculty to publish, browse, search, update, and manage engineering capstone and research projects.

---

## 📁 Project Structure

```
engineering-showcase/
├── client/                     # Frontend (React + Vite)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, ProjectCard)
│   │   ├── context/            # React Context (ProjectContext state management)
│   │   ├── pages/              # Page views (Home, Projects, Detail, Form, 404)
│   │   ├── services/           # Axios HTTP client and API service calls
│   │   ├── App.jsx             # React Router routing setup
│   │   ├── index.css           # Styling & responsive design system
│   │   └── main.jsx            # React root mount
│   ├── .env.example            # Client environment template
│   ├── .gitignore              # Client git ignore
│   ├── index.html              # HTML entry point
│   ├── package.json            # Client dependencies and scripts
│   └── vite.config.js          # Vite config with API proxy
│
├── server/                     # Backend (Node.js + Express + Mongoose)
│   ├── config/
│   │   └── db.js               # MongoDB connection logic using Mongoose
│   ├── controllers/
│   │   └── projectController.js # CRUD controller actions with search & filters
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT authentication middleware
│   │   └── errorHandler.js     # Centralized error handling
│   ├── models/
│   │   ├── User.js             # User schema (student/admin, department)
│   │   ├── Project.js          # Project schema (title, category, techStack, owner)
│   │   ├── Comment.js          # Project comments schema (project, author, text)
│   │   └── CollaborationRequest.js # Collaboration requests schema
│   ├── routes/
│   │   └── projectRoutes.js    # Express routes with express-validator
│   ├── seed.js                 # Seed script inserting 2 users & 8 sample projects
│   ├── .env.example            # Server environment template
│   ├── .gitignore              # Server git ignore
│   ├── package.json            # Server dependencies and scripts
│   └── server.js               # Express app entry point (PORT 5001)
│
├── .gitignore                  # Root git ignore
└── README.md                   # Project documentation & run guide
```

---

## 🛠️ Tech Stack & Dependencies

### Backend (`/server`)
- **Runtime & Framework**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Security & Utilities**:
  - `cors`: Cross-Origin Resource Sharing
  - `dotenv`: Environment configuration
  - `bcryptjs`: Password hashing
  - `jsonwebtoken`: JWT authentication
  - `express-validator`: Server-side request validation
- **Dev Tool**: `nodemon` (hot reloading)

### Frontend (`/client`)
- **Build Tool & Framework**: [Vite](https://vitejs.dev/) + [React](https://react.dev/)
- **Routing**: [React Router](https://reactrouter.com/) (`react-router-dom`)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **State Management**: React Context API (`ProjectContext`)

---

## ⚙️ Prerequisites

1. **Node.js** (v18+) and **npm**
2. **MongoDB** installed and running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI.

---

## 🚀 How to Run the Project

### 1. Configure Environment Variables

#### Backend (`/server`)
```bash
cd server
cp .env.example .env
```
Ensure `server/.env` contains:
```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/engineering_showcase
JWT_SECRET=super_secret_jwt_key_engineering_showcase_2026
CLIENT_URL=http://localhost:5173
```

#### Frontend (`/client`)
```bash
cd client
cp .env.example .env
```
Ensure `client/.env` contains:
```env
VITE_API_URL=http://localhost:5001/api
```

---

### 2. Seed Database & Start Server

Open a terminal window:
```bash
cd server

# Seed 2 users and 8 sample engineering projects
npm run seed

# Start development server
npm run dev
```
👉 Server running at: **`http://localhost:5001`**

---

### 3. Start Frontend Client

Open a second terminal window:
```bash
cd client
npm run dev
```
👉 Client running at: **`http://localhost:5173`**

---

## 👥 Seeded Users (Password: `Password123!`)
- **Student**: `alex.rivera@eng.university.edu` (Department: Computer Engineering)
- **Admin**: `sarah.chen@eng.university.edu` (Department: Electrical & Electronic Engineering)
