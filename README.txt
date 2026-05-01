Team Task Manager

A Python-first full-stack task manager for the assignment. FastAPI powers the REST API, authentication, role-based access control, database relationships, and also serves the built React frontend for Railway deployment.

Assignment coverage:
- Authentication: signup, login, JWT sessions, hashed passwords.
- Project and team management: users create projects, invite existing users, and assign admin or member roles.
- Task management: admins create/delete tasks, assign project members, set due dates, and everyone in the project can update task status.
- Dashboard: per-user counts for to-do, in-progress, done, and overdue assigned tasks.
- Database: SQLAlchemy models for users, projects, project members, and tasks with foreign keys and unique membership constraints.
- Validation: Pydantic request validation for email, password length, names, roles, statuses, and field lengths.
- RBAC: project membership is required for project/task access; admin role is required for member management and task creation/deletion.
- Deployment: configured for Railway with Nixpacks.

Tech stack:
- Backend: Python, FastAPI, SQLAlchemy, Pydantic, python-jose, Passlib/bcrypt.
- Database: PostgreSQL on Railway, SQLite fallback for local development.
- Frontend: React, Vite, Axios.
- Deployment: Railway single-service deploy.

Local setup:
cd frontend
npm install
npm run build
cd ..
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --port 5000

Open http://localhost:5000.

Environment variables for Railway:
DATABASE_URL=postgresql://...
SECRET_KEY=replace-with-a-strong-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

REST API:
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me
- POST /api/projects/
- GET /api/projects/
- GET /api/projects/{id}
- GET /api/projects/{id}/members
- POST /api/projects/{id}/members
- DELETE /api/projects/{id}/members/{user_id}
- GET /api/tasks/dashboard
- POST /api/tasks/
- GET /api/tasks/?project_id={id}
- PATCH /api/tasks/{id}
- DELETE /api/tasks/{id}

Railway deployment:
1. Push this repository to GitHub.
2. Create a Railway project from the GitHub repository.
3. Add a PostgreSQL database in Railway.
4. Set DATABASE_URL, SECRET_KEY, ALGORITHM, and ACCESS_TOKEN_EXPIRE_MINUTES.
5. Railway will use nixpacks.toml to install Python dependencies, install frontend dependencies, build React, and start FastAPI.
6. The live app will be available at the Railway service URL.

Submission checklist:
- Live Application URL: add your Railway URL in the assignment form.
- GitHub Repository Link: https://github.com/ayushagrawalmi78-cpu/task-manager
- README upload: use README.txt or README.md as requested by the form.
- Demo video: record a 2-5 minute walkthrough covering signup/login, project creation, adding a member, creating/assigning tasks, changing statuses, dashboard stats, and admin/member restrictions.

Author:
Ayush Agrawal
