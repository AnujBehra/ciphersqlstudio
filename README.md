# CipherSQLStudio

A browser-based SQL learning platform where students can practice SQL queries against pre-configured assignments with real-time execution and intelligent hints.

## 🏗️ Architecture

```
Frontend (React + SCSS) ↔ Backend API (Express.js)
                            ├── PostgreSQL (Query Execution / Sandbox)
                            ├── MongoDB Atlas (Assignments, User Progress)
                            └── Gemini LLM API (Hint Generation)
```

## 📋 Features

### Core Features
- **Assignment Listing Page** — Browse SQL assignments by difficulty (Easy/Medium/Hard)
- **Assignment Attempt Interface** — Question panel, sample data viewer, Monaco SQL editor, results panel
- **Query Execution Engine** — Execute SQL queries against PostgreSQL with validation & sanitization
- **LLM Hint Integration** — Get intelligent hints (not solutions) powered by Google Gemini

### Optional Features
- Login/Signup system
- Save user's SQL query attempts per assignment

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React.js |
| Styling | Vanilla SCSS (mobile-first, BEM) |
| Code Editor | Monaco Editor |
| Runtime | Node.js / Express.js |
| Sandbox DB | PostgreSQL |
| Persistence DB | MongoDB (Atlas) |
| LLM | Google Gemini API |

## 📁 Project Structure

```
cipherschool/
├── client/                  # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── styles/          # SCSS partials & variables
│   │   ├── services/        # API service calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                  # Express Backend
│   ├── config/              # DB connections
│   ├── controllers/         # Route handlers
│   ├── middleware/           # Auth, error handling
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── seeds/               # Seed data
│   ├── server.js
│   └── package.json
├── CipherSqlStudio-assignment.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally or remote)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Variables

#### Server (`server/.env`)
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ciphersqlstudio
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_pg_password
PG_DATABASE=ciphersqlstudio
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
```

#### Client (`client/.env`)
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

This will:
- Import assignments into MongoDB from the dataset
- Create PostgreSQL schemas and tables with sample data

### 4. Run the Application

```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📊 Data Flow

1. **User visits homepage** → Frontend fetches assignment list from MongoDB via API
2. **User selects assignment** → Frontend loads assignment details + sample data
3. **User writes SQL query** → Monaco Editor provides syntax highlighting
4. **User clicks "Execute"** → Query sent to backend → Executed in PostgreSQL sandbox → Results returned
5. **User clicks "Get Hint"** → Backend sends question context to Gemini API → Returns hint (not solution)
6. **Results displayed** → Formatted table shows query output or error messages

## 🔒 Security

- SQL queries are validated and sanitized before execution
- Each assignment runs in an isolated PostgreSQL schema
- Queries are wrapped in read-only transactions
- DML/DDL statements (INSERT, UPDATE, DELETE, DROP, etc.) are blocked
