# Team Task Manager

A Python-first full-stack task manager built for the assignment. FastAPI powers the REST API, authentication, role-based access control, database relationships, and serves the built React frontend from the same Railway service.

## Live Links

Live Application: https://task-manager-production-8920.up.railway.app

GitHub Repository: https://github.com/ayushagrawalmi78-cpu/task-manager

## Assignment Coverage

- Authentication: signup, login, JWT sessions, hashed passwords.
- Project and team management: users create projects, add existing users, and assign admin or member roles.
- Task management: admins create/delete tasks, assign project members, set due dates, and project members can update task status.
- Dashboard: per-user counts for to-do, in-progress, done, and overdue assigned tasks.
- Database: SQLAlchemy models for users, projects, project members, and tasks with foreign keys and unique membership constraints.
- Validation: Pydantic request validation for email, password length, names, roles, statuses, and field lengths.
- RBAC: project membership is required for project/task access; admin role is required for member management and task creation/deletion.
- Deployment: deployed on Railway as a single Docker-based service.

## Tech Stack

- Backend: Python, FastAPI, SQLAlchemy, Pydantic, python-jose, Passlib/bcrypt.
- Database: PostgreSQL on Railway, SQLite fallback for local development.
- Frontend: React, Vite, Axios.
- Deployment: Railway with Dockerfile.

## Project Structure

```text
task-manager/
  backend/
    main.py
    database.py
    models.py
    schemas.py
    auth.py
    routers/
      auth.py
      projects.py
      tasks.py
  frontend/
    src/
      pages/
      components/
      api.js
      App.jsx
    package.json
  Dockerfile
  railway.json
  README.md
  README.txt
```

## Local Setup

```bash
cd frontend
npm install
npm run build
cd ..
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --port 5000
```

Open:

```text
http://localhost:5000
```

## Environment Variables

```env
DATABASE_URL=postgresql://...
SECRET_KEY=replace-with-a-strong-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

## REST API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/projects/`
- `GET /api/projects/`
- `GET /api/projects/{id}`
- `GET /api/projects/{id}/members`
- `POST /api/projects/{id}/members`
- `DELETE /api/projects/{id}/members/{user_id}`
- `GET /api/tasks/dashboard`
- `POST /api/tasks/`
- `GET /api/tasks/?project_id={id}`
- `PATCH /api/tasks/{id}`
- `DELETE /api/tasks/{id}`

## Railway Deployment

1. Push the repository to GitHub.
2. Create a Railway project from the GitHub repository.
3. Add a PostgreSQL database in Railway.
4. Set `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, and `ACCESS_TOKEN_EXPIRE_MINUTES`.
5. Railway builds the app using `Dockerfile`.
6. The Dockerfile builds the React frontend, installs Python backend dependencies, and starts FastAPI.
7. Generate a Railway public domain for the service.

## Submission

- Live Application URL: https://task-manager-production-8920.up.railway.app
- GitHub Repository Link: https://github.com/ayushagrawalmi78-cpu/task-manager
- README upload: `README.txt`
- Demo video: 2-5 minute walkthrough covering signup/login, project creation, adding a member, creating/assigning tasks, changing statuses, dashboard stats, and admin/member restrictions.

## Author

Ayush
