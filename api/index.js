/* global process */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { analyzePlan, answerQuestion } from '../src/utils/planner.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_home_planner',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'smart-home-secret', { expiresIn: '1h' });
}

app.get('/api/health', (_req, res) => res.json({ ok: true, message: 'Smart home planner backend is running.' }));

app.get('/', (_req, res) => res.send('Smart Home Planner API is running. Please access the frontend via the Vite dev server (e.g., http://localhost:5173).'));

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
  
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ message: 'User already exists.' });
    
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name || 'User', email, hashed]
    );
    
    const user = { id: result.insertId, email, name: name || 'User' };
    res.json({ message: 'User registered successfully.', token: signToken(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid email or password.' });
    
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });
    
    res.json({ message: 'Login successful.', token: signToken(user), user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.post('/api/plans', async (req, res) => {
  // Mock user_id = 1 for now if no auth middleware is present
  const user_id = 1; 
  const { plotSize, plotShape, facing, floors, rooms, houseType, apartmentType } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO house_plans (user_id, plot_size, plot_shape, facing, floors, rooms, house_type, apartment_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, plotSize, plotShape, facing, floors, rooms, houseType, apartmentType]
    );
    res.status(201).json({ message: 'Plan saved successfully.', planId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.get('/api/plans', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM house_plans');
    res.json({ plans: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.post('/api/analyze', (req, res) => {
  const result = analyzePlan(req.body);
  res.json(result);
});

app.post('/api/ask', (req, res) => {
  const { question } = req.body;
  if (!question || !String(question).trim()) {
    return res.status(400).json({ message: 'Please enter a question for the AI suggestion engine.' });
  }

  const analysis = analyzePlan(req.body);
  res.json({ answer: answerQuestion(question, req.body, analysis) });
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Smart home backend listening on http://localhost:${port}`);
  });
}

export default app;
