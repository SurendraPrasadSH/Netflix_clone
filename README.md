
***

# Netflix Clone - Full Stack Project with DevOps Automation

## Project Overview
This project replicates core features of Netflix as a full-stack web application combined with DevOps automation. It integrates a responsive React-based frontend, a Node.js backend API, PostgreSQL database hosted on Supabase, and Dockerized infrastructure for deployment readiness.

***

## Features

### Frontend
- Responsive user interface built in React (or static HTML/JS if applicable).
- Landing page with email signup form.
- Fetch API integration for seamless backend communication.
  
### Backend
- REST API built with Express.js.
- CORS enabled for cross-origin frontend requests.
- Integration with Supabase for PostgreSQL cloud database.
- Email signup data validation and storage.

### DevOps & Infrastructure
- Backend containerized using Docker.
- Frontend served via static web server or containerized.
- Ready for multi-container orchestration (Docker Compose/Kubernetes).
- Plans for CI/CD pipeline automation using GitHub Actions or similar.

***

## Technologies & Tools

| Layer      | Technology                |
|------------|---------------------------|
| Frontend   | React.js / HTML/CSS/JS    |
| Backend    | Node.js, Express.js       |
| Database   | Supabase (PostgreSQL)     |
| Container  | Docker                    |
| DevOps     | Docker Compose, CI/CD     |

***

## Setup Guide

### Prerequisites
- Node.js & npm installed
- Docker installed
- Supabase account with project and API keys
- Git for repo cloning

### Backend Setup
1. Clone the repo and navigate to `backend/`.
2. Configure `server.js` with your Supabase URL and anon/public key.
3. Install dependencies using:
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```
5. To run in Docker container:
   ```bash
   docker build -t netflix-backend .
   docker run -p 3000:3000 netflix-backend
   ```

### Frontend Setup
- Serve the static frontend folder `Netflix-Clone` using:
  ```bash
  npm install -g http-server
  http-server -p 8080
  ```
- Visit `http://localhost:8080` in your browser.

***

## Important Notes
- Backend must run on port 3000. Frontend must run on a different port to avoid conflicts.
- CORS is enabled in backend to allow cross-origin requests from the frontend.
- The Supabase `users` table requires appropriate Row-Level Security (RLS) policy to allow inserts.
- Emails submitted via the frontend form are saved in Supabase.

***

## Planned Enhancements
- Dockerize the frontend and build multi-container orchestration.
- Implement secure authentication and user profiles.
- Add CI/CD pipelines for automated testing, builds, and deployments.
- Improve UI/UX with better animations and accessibility.
- Expand backend features for movie catalog, search, and recommendations.

***

## Contribution and Support
Welcome contributions. Open issues for bugs or feature requests.

For support or questions, please contact: surendrap792@gmail.com

***

## License
MIT License

***

