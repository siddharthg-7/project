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

const users = [];
const plans = [];

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'smart-home-secret', { expiresIn: '1h' });
}

app.get('/api/health', (_req, res) => res.json({ ok: true, message: 'Smart home planner backend is running.' }));

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
  const existing = users.find((u) => u.email === email);
  if (existing) return res.status(409).json({ message: 'User already exists.' });
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, name: name || 'User', email, password: hashed };
  users.push(user);
  res.json({ message: 'User registered successfully.', token: signToken(user), user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((item) => item.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid email or password.' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });
  res.json({ message: 'Login successful.', token: signToken(user), user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/api/plans', (req, res) => {
  const plan = { id: plans.length + 1, ...req.body, createdAt: new Date().toISOString() };
  plans.push(plan);
  res.status(201).json({ message: 'Plan saved successfully.', plan });
});

app.get('/api/plans', (_req, res) => res.json({ plans }));

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
