# Debate Management System (DMS)

**CO2060 – Second Year Software Engineering Project**

A full-stack web application designed to streamline the organization, management, and evaluation of debate tournaments. Traditional debate tournaments rely on manual processes for scheduling, judging, scoring, and result compilation — this platform addresses all of that with a centralized, role-based digital system.

---

## Tech Stack

**Frontend:** React + TypeScript + Vite + Tailwind CSS + React Router + Recharts  
**Backend:** Spring Boot + Java + Spring Security (JWT) + JPA/Hibernate  
**Database:** PostgreSQL

---

## Prerequisites

- Node.js >= 18
- Java 17+
- Maven 3.8+
- PostgreSQL 14+

---

## Setup Instructions

### 1. Database Setup

```bash
psql -U postgres
CREATE DATABASE dms_db;
\q
```

### 2. Backend Setup

```bash
cd backend

# Copy environment config
cp src/main/resources/application.properties.example src/main/resources/application.properties

# Edit application.properties with your PostgreSQL credentials, then:
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Sample Users (from seed data)

| Role       | Username    | Password    |
|------------|-------------|-------------|
| Organizer  | organizer1  | password123 |
| Debater    | debater1    | password123 |
| Debater    | debater2    | password123 |
| Judge      | judge1      | password123 |
| Judge      | judge2      | password123 |

---

## User Roles

- **Organizer** — Create & manage tournaments, set up score sheets, assign judges, generate match rounds
- **Judge** — View assigned matches, submit digital score sheets, select best speaker
- **Debater** — Track personal stats, join tournament discussions, view match history

---

## API Documentation

Base URL: `http://localhost:8080/api`

### Auth
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Login and receive JWT
- `GET /api/auth/me` — Get current user info

### Search
- `GET /api/search?query=` — Search players, tournaments, organizers

### Users
- `GET /api/users/{id}` — Get user profile
- `PUT /api/users/{id}` — Update user profile
- `GET /api/users/debaters/search?query=` — Search debaters
- `GET /api/users/judges/search?query=` — Search judges

### Tournaments
- `POST /api/tournaments` — Create tournament
- `GET /api/tournaments` — List all tournaments
- `GET /api/tournaments/{id}` — Get tournament detail
- `GET /api/tournaments/organizer/{organizerId}` — Get organizer's tournaments
- `DELETE /api/tournaments/{id}` — Delete tournament

### Judges
- `POST /api/tournaments/{id}/judges` — Add judge to tournament
- `GET /api/tournaments/{id}/judges` — Get tournament judges

### Matches
- `POST /api/matches` — Create match
- `GET /api/tournaments/{id}/matches` — Get tournament matches
- `GET /api/matches/{id}` — Get match detail
- `POST /api/tournaments/{id}/generate-next-round` — Generate next knockout round

### Score Sheets
- `POST /api/score-templates` — Save score sheet template
- `GET /api/score-templates/{tournamentId}` — Get template
- `GET /api/score-sheets/{matchId}/{judgeId}` — Get score sheet
- `POST /api/score-sheets/submit` — Submit score sheet
- `POST /api/score-sheets/{id}/reopen` — Reopen score sheet

### Stats
- `GET /api/stats/debater/{id}` — Debater statistics
- `GET /api/stats/judge/{id}` — Judge statistics
- `GET /api/tournaments/{id}/leaderboard` — Tournament leaderboard

### Discussion
- `GET /api/tournaments/{id}/discussion` — Get discussion comments
- `POST /api/discussion` — Post comment
- `DELETE /api/discussion/{id}` — Delete comment
- `POST /api/discussion/{id}/reply` — Reply to comment

### Notifications
- `GET /api/notifications` — Get user notifications
- `PUT /api/notifications/{id}/read` — Mark notification read

### Calendar
- `GET /api/calendar` — Get calendar events
- `POST /api/calendar` — Create calendar event
- `PUT /api/calendar/{id}/reminder` — Toggle reminder

### News
- `GET /api/news` — Get news posts
- `POST /api/news` — Create news post

---

## Project Structure

```
DMS/
├── backend/                        # Spring Boot application
│   ├── src/main/java/com/dms/
│   │   ├── entity/                 # JPA entities
│   │   ├── dto/                    # Data Transfer Objects
│   │   ├── repository/             # Spring Data JPA repos
│   │   ├── service/                # Business logic layer
│   │   ├── controller/             # REST API controllers
│   │   ├── security/               # JWT filter & util
│   │   ├── exception/              # Global exception handler
│   │   └── config/                 # Security & CORS config
│   └── src/main/resources/
│       ├── application.properties  # DB & JWT config
│       └── data.sql                # Seed data
└── frontend/                       # React application
    └── src/
        ├── components/
        │   ├── layout/             # Navbar, Footer, PublicLayout
        │   └── common/             # Avatar, Toast, SearchBar, Spinner
        ├── pages/
        │   ├── public/             # Home, Scoring, News, About, Search
        │   ├── auth/               # RoleSelect, Login, Signup
        │   ├── dashboard/          # Debater, Judge, Organizer dashboards
        │   ├── tournament/         # Tournament page, CreateWizard, ScoreSheet
        │   └── shared/             # Notifications, Calendar, Settings, Profile
        ├── context/                # AuthContext (JWT + user state)
        ├── api/                    # Axios instance + all API calls
        └── types/                  # TypeScript interfaces
```

---

For more details: [https://projects.ce.pdn.ac.lk](https://projects.ce.pdn.ac.lk)
