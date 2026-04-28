# Debate Management System (DMS)

A full-stack web application for managing debate tournaments, matches, scoring, and participants.

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
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE dms_db;
\q
```

### 2. Backend Setup

```bash
cd backend

# Copy environment config
cp src/main/resources/application.properties.example src/main/resources/application.properties

# Update application.properties with your PostgreSQL credentials

# Run the application (this will auto-create tables and seed data)
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Copy environment config
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Sample Users (from seed data)

| Role       | Username       | Password   |
|------------|----------------|------------|
| Organizer  | organizer1     | password123|
| Debater    | debater1       | password123|
| Debater    | debater2       | password123|
| Judge      | judge1         | password123|
| Judge      | judge2         | password123|

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
- `PUT /api/tournaments/{id}` — Update tournament
- `DELETE /api/tournaments/{id}` — Delete tournament

### Schools
- `POST /api/schools` — Add school to tournament
- `POST /api/schools/{schoolId}/debaters` — Add debater to school

### Judges
- `POST /api/tournaments/{id}/judges` — Add judge to tournament
- `GET /api/tournaments/{id}/judges` — Get tournament judges

### Matches
- `POST /api/matches` — Create match
- `GET /api/tournaments/{id}/matches` — Get tournament matches
- `GET /api/matches/{id}` — Get match detail
- `POST /api/matches/{id}/assign-judges` — Assign judges to match
- `POST /api/matches/{id}/complete` — Mark match complete
- `POST /api/tournaments/{id}/generate-next-round` — Generate next knockout round

### Score Sheets
- `POST /api/score-templates` — Create score sheet template
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
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/dms/
│   │   ├── entity/           # JPA entities
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── repository/       # JPA repositories
│   │   ├── service/          # Business logic
│   │   ├── controller/       # REST controllers
│   │   ├── security/         # JWT & Spring Security
│   │   ├── exception/        # Exception handling
│   │   └── config/           # App configuration
│   └── src/main/resources/
│       ├── application.properties
│       └── data.sql           # Seed data
└── frontend/                 # React application
    └── src/
        ├── components/       # Reusable components
        ├── pages/            # Route pages
        ├── context/          # React Context (Auth)
        ├── api/              # API layer (Axios)
        ├── hooks/            # Custom hooks
        ├── types/            # TypeScript interfaces
        └── utils/            # Utility functions
```
