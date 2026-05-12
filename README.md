<div align="center">

# 🚀 TaskFlow — Collaborative Project & Task Management

**A lightweight, high-performance web application for efficient team collaboration and streamlined project management.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_App-2ea44f?style=for-the-badge)](https://dbs-mini-project-zr8l.vercel.app)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Contributors](#-contributors)

---

## 💡 About

TaskFlow bridges the gap between overly simplistic tools like Trello and complex enterprise solutions like Jira. It focuses on core functionalities — **authentication**, **team hierarchies**, and **visual task tracking** — to ensure productivity without unnecessary overhead.

Built as a **Database Systems Mini Project**, this application demonstrates practical implementation of relational database concepts including normalization (3NF), referential integrity through foreign key constraints, and cascading operations.

---

## ✨ Features

| Feature | Description |
|:---|:---|
| 🔐 **Secure Authentication** | JWT-based token auth with bcrypt password hashing |
| 👥 **Role-Based Teams** | Create teams with admin and member roles |
| 📁 **Project Management** | Organize tasks into projects within teams |
| ✅ **Task Tracking** | Tasks with descriptions, priorities, deadlines, and assignees |
| 📊 **Kanban Board** | Visual three-column board (To Do → In Progress → Done) |
| 🔍 **Advanced Filtering** | Search and filter tasks by status, assignee, or priority |
| 🎨 **Modern UI** | Clean, responsive interface with smooth animations |

---

## 🛠 Tech Stack

<table>
<tr>
<td align="center" width="50%">

### Frontend
| Technology | Purpose |
|:---|:---|
| **React 18** | Component-based UI |
| **Redux Toolkit** | Global state management |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |
| **Vite** | Build tool & dev server |

</td>
<td align="center" width="50%">

### Backend
| Technology | Purpose |
|:---|:---|
| **Node.js** | Runtime environment |
| **Express.js** | REST API framework |
| **MySQL 8.0** | Relational database |
| **mysql2** | Database driver |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |

</td>
</tr>
</table>

---

## 🗄 Database Schema

The schema is normalized to **Third Normal Form (3NF)** with foreign key constraints and cascading operations for referential integrity.

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Users     │       │    Teams     │       │   Projects   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ User_ID (PK) │──┐    │ Team_ID (PK) │──┐    │Project_ID(PK)│
│ User_Name    │  │    │ Team_Name    │  │    │ Title        │
│ Email_ID(UQ) │  │    │ Creator_ID   │──┘    │ Team_ID (FK) │
│ Password     │  │    └──────────────┘  │    │ Handled_By   │
└──────────────┘  │                      │    │ Deadline     │
                  │    ┌──────────────┐  │    └──────────────┘
                  │    │  Membership  │  │           │
                  │    ├──────────────┤  │    ┌──────────────┐
                  ├───▶│ User_ID (FK) │  │    │    Tasks     │
                  │    │ Team_ID (FK) │◀─┤    ├──────────────┤
                  │    │ Is_Admin     │  │    │ Task_ID (PK) │
                  │    └──────────────┘  │    │ Task_Desc    │
                  │                      │    │ Deadline     │
                  │    ┌──────────────┐  │    │ Part_Of (FK) │
                  │    │   Status     │  │    │Assigned_To   │
                  │    ├──────────────┤  │    │Status_ID(FK) │
                  │    │Status_ID(PK) │──┘    └──────────────┘
                  │    │ Status_Name  │
                  │    └──────────────┘
                  │
                  └─── (Referenced by Teams.Creator_ID,
                        Tasks.Assigned_To, Membership.User_ID)
```

---

## 📁 Project Structure

```
DBS-Mini-Project/
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   └── TeamCard.jsx
│   │   ├── pages/              # Application pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Teams.jsx
│   │   │   ├── TeamDetail.jsx
│   │   │   └── Project.jsx
│   │   ├── services/           # API client configuration
│   │   ├── store/              # Redux state management
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # Utility functions
│   ├── vercel.json             # Vercel SPA routing config
│   └── vite.config.js
│
├── server/                     # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Environment configuration
│   │   ├── controllers/        # Request handlers
│   │   ├── db/                 # Database connection pool
│   │   ├── middleware/         # Auth middleware (JWT)
│   │   ├── migrations/        # SQL schema (init.sql)
│   │   ├── models/            # Data access layer
│   │   ├── routes/            # API route definitions
│   │   └── server.js          # Entry point
│   └── vercel.json            # Vercel serverless config
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v14+
- **MySQL Server** 8.0+
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/pking-hecs/DBS-Mini-Project.git
cd DBS-Mini-Project
```

### 2. Database Setup

```bash
# Log into MySQL and import the schema
sudo mysql -u root < server/src/migrations/init.sql
```

This creates the `dbsMP` database with all required tables and sample data.

### 3. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=dbsMP
DB_PORT=3306
JWT_SECRET=your_secret_key_here
```

Start the server:

```bash
npm run dev
```

### 4. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login & receive JWT token |
| `GET` | `/api/auth/me` | Get current user profile |

### Teams
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/teams` | List all teams for user |
| `POST` | `/api/teams` | Create a new team |
| `GET` | `/api/teams/:id` | Get team details |
| `PATCH` | `/api/teams/:id` | Update team |
| `DELETE` | `/api/teams/:id` | Delete team |
| `POST` | `/api/teams/:id/members` | Add team member |
| `PATCH` | `/api/teams/:id/members/:userId` | Update member role |
| `DELETE` | `/api/teams/:id/members/:userId` | Remove member |

### Projects
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/projects?teamId=` | List projects for a team |
| `POST` | `/api/projects` | Create a project |
| `GET` | `/api/projects/:id` | Get project details |
| `PUT` | `/api/projects/:id` | Update project |
| `DELETE` | `/api/projects/:id` | Delete project |

### Tasks
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/tasks` | List tasks (with filters) |
| `POST` | `/api/tasks` | Create a task |
| `GET` | `/api/tasks/:id` | Get task details |
| `PUT` | `/api/tasks/:id` | Update task |
| `DELETE` | `/api/tasks/:id` | Delete task |

---

## ☁️ Deployment

The application is deployed on **Vercel** with **Aiven MySQL** as the cloud database.

| Service | Platform |
|:---|:---|
| Frontend | [Vercel](https://vercel.com/) |
| Backend API | [Vercel Serverless Functions](https://vercel.com/) |
| Database | [Aiven MySQL](https://aiven.io/) |

### Environment Variables (Vercel)

**Backend Project:**
| Variable | Description |
|:---|:---|
| `DB_HOST` | Aiven MySQL hostname |
| `DB_PORT` | Aiven MySQL port |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CLIENT_URL` | Frontend URL (or `*`) |

**Frontend Project:**
| Variable | Description |
|:---|:---|
| `VITE_API_URL` | Backend deployment URL |

---

## 👥 Contributors

<table>
<tr>
<td align="center"><b>Aditya Gayan</b></td>
<td align="center"><b>Ayush Ashutosh Jena</b></td>
<td align="center"><b>Naseh Ameen Sayrawala</b></td>
<td align="center"><b>Tarun P</b></td>
</tr>
</table>

---

<div align="center">

**Built with ❤️ as a Database Systems Mini Project**

</div>
