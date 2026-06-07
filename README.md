# AI-Based Smart Home & Apartment Planning Website

This project is a full-stack React + Express application for smart home planning, Vastu analysis, parking planning, and budget estimation.

## Features
- Modern Tailwind-based UI
- JWT-style register/login mock authentication
- Planner analysis API for Vastu, budget, and parking
- MySQL schema for users, plans, floors, rooms, parking, and reports

## Setup
1. Install dependencies: npm install
2. Start the backend: npm run backend
3. Start the frontend: npm run dev
4. Open http://localhost:5173

## API routes
- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- POST /api/plans
- GET /api/plans
- POST /api/analyze

## Database
Import the MySQL schema from backend/schema.sql into a local MySQL server if you want to wire the app to a real database.
