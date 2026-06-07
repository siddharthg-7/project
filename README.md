# AI-Based Smart Home & Apartment Planning Website

This project is a full-stack React + Express application for smart home planning, Vastu analysis, parking planning, and budget estimation.

## Features
- Modern Tailwind-based UI
- JWT-style register/login mock authentication
- Planner analysis API for Vastu, budget, and parking
- MySQL schema for users, plans, floors, rooms, parking, and reports

## Setup
1. Install dependencies: npm install
2. Start the frontend: npm run dev
3. (Optional) Start the backend for API testing: npm run backend
4. Open http://localhost:5173

## API routes
- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- POST /api/plans
- GET /api/plans
- POST /api/analyze

## Vercel deployment
The app is configured as a single-page React app with a Vercel fallback route, so direct visits to `/planner` and `/analysis` resolve correctly after deploy.

## Database
Import the MySQL schema from backend/schema.sql into a local MySQL server if you want to wire the app to a real database.
