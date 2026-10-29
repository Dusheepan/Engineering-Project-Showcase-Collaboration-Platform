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
│   │   ├── Project.js          # Engineering project Mongoose schema
│   │   └── User.js             # User / student account schema
│   ├── routes/
│   │   └── projectRoutes.js    # Express routes with express-validator
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
- **Routing**: [React Router](https://reactrouter.com/) (`react-router-dom` v7)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **State Management**: React Context API (`ProjectContext`)

---

## ⚙️ Prerequisites

Before running the application, make sure you have:
1. **Node.js** (v18 or higher recommended) and **npm** installed.
   ```bash
   node -v
   npm -v
   ```
2. **MongoDB** installed and running locally, or a **MongoDB Atlas** cloud connection URI.
   - Start local MongoDB service (macOS / Homebrew):
     ```bash
     brew services start mongodb-community
     ```

---

## 🚀 How to Run the Project

### 1. Configure Environment Variables

#### Backend (`/server`)
In `engineering-showcase/server`:
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
In `engineering-showcase/client`:
```bash
cd client
cp .env.example .env
```
Ensure `client/.env` contains:
```env
VITE_API_URL=http://localhost:5001/api
```

---

### 2. Start the Backend Server

Open a terminal window:
```bash
cd server

# Install dependencies (if not already installed)
npm install

# Start development server with auto-restart on changes
npm run dev

# Or start in standard production mode
npm start
```
The server will start listening at:
👉 **`http://localhost:5001`**

---

### 3. Start the Frontend Client

Open a **separate** terminal window:
```bash
cd client

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
The client will launch at:
👉 **`http://localhost:5173`**

Open your web browser and navigate to `http://localhost:5173`.

---

## 📡 API Endpoints Reference

Base URL: `http://localhost:5001/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and health check |
| `GET` | `/api/projects` | Get all projects (supports query params: `search`, `department`, `status`, `sortBy`, `order`) |
| `GET` | `/api/projects/:id` | Get details of a single project by ID |
| `POST` | `/api/projects` | Create a new engineering project |
| `PUT` | `/api/projects/:id` | Update an existing project by ID |
| `DELETE`| `/api/projects/:id` | Delete a project safely by ID |

---

## 🧪 Testing the API with cURL

Create a sample project:
```bash
curl -X POST http://localhost:5001/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Smart IoT Grid Monitor",
    "description": "An automated power grid monitoring system utilizing ESP32 microcontrollers and MQTT.",
    "department": "Electrical & Electronic Engineering",
    "technologies": ["ESP32", "C++", "MQTT", "Node.js", "MongoDB"],
    "teamMembers": ["A. Perera", "K. Silva"],
    "supervisor": "Dr. Fernando",
    "githubUrl": "https://github.com/example/iot-grid-monitor",
    "status": "In Progress"
  }'
```

List projects:
```bash
curl http://localhost:5001/api/projects
```
