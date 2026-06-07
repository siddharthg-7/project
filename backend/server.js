/* global process */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const users = [];
const plans = [];

const vastuRules = {
  North: {
    mainDoor: 'North-East quadrant',
    kitchen: 'South-East',
    bedroom: 'South-West',
    pooja: 'North-East',
    living: 'North-West',
    bathroom: 'West',
    staircase: 'South',
    score: 88,
  },
  South: {
    mainDoor: 'South-East',
    kitchen: 'North-West',
    bedroom: 'North-East',
    pooja: 'East',
    living: 'North',
    bathroom: 'South-West',
    staircase: 'West',
    score: 84,
  },
  East: {
    mainDoor: 'North-East',
    kitchen: 'South-East',
    bedroom: 'South-West',
    pooja: 'North-East',
    living: 'North',
    bathroom: 'South',
    staircase: 'North-West',
    score: 90,
  },
  West: {
    mainDoor: 'North-West',
    kitchen: 'South-West',
    bedroom: 'North-East',
    pooja: 'West',
    living: 'East',
    bathroom: 'North',
    staircase: 'East',
    score: 82,
  },
};

function estimateBudget(form) {
  const normalized = String(form.plotSize || '40x60').replace(/\s*yards?/i, '');
  const [w, h] = normalized.split('x').map(Number);
  const area = w * h;
  const propertyFactor = {
    'Independent House': 1.1,
    'Duplex House': 1.0,
    Villa: 1.35,
    Apartment: 0.85,
    Flat: 0.75,
  }[form.propertyType] || 1;
  const cement = area * 125 * propertyFactor;
  const steel = area * 85 * propertyFactor;
  const bricks = area * 40 * propertyFactor;
  const labour = area * 70 * propertyFactor;
  const flooring = area * 55 * propertyFactor;
  const parking = (Number(form.parkingCars) + Number(form.parkingBikes) * 0.6 + Number(form.parkingEv) * 2) * 350000;
  const total = cement + steel + bricks + labour + flooring + parking;
  return { cement, steel, bricks, labour, flooring, parking, total };
}

function analyzePlan(form) {
  const rule = vastuRules[form.facing] || vastuRules.North;
  const budget = estimateBudget(form);
  const normalized = String(form.plotSize || '40x60').replace(/\s*yards?/i, '');
  const [w, h] = normalized.split('x').map(Number);
  const plotArea = (w || 40) * (h || 60);
  const roomDistribution = {
    'Independent House': [
      ['Main Entrance', 0.06], ['Living Room', 0.18], ['Kitchen', 0.10], ['Bedroom', 0.14], ['Pooja', 0.05], ['Parking', 0.18], ['Garden', 0.14], ['Balcony', 0.07],
    ],
    'Duplex House': [
      ['Entrance', 0.06], ['Living Room', 0.16], ['Kitchen', 0.10], ['Bedroom', 0.13], ['Study', 0.08], ['Staircase', 0.08], ['Balcony', 0.08], ['Terrace', 0.11],
    ],
    Villa: [
      ['Portico', 0.08], ['Living Room', 0.18], ['Dining', 0.10], ['Kitchen', 0.10], ['Master Bedroom', 0.15], ['Guest Room', 0.10], ['Garden', 0.16], ['Garage', 0.08],
    ],
    Apartment: [
      ['Entry Lobby', 0.07], ['Living', 0.16], ['Kitchen', 0.10], ['Bedroom', 0.14], ['Balcony', 0.06], ['Lift Core', 0.05], ['Parking', 0.20], ['Utility', 0.06],
    ],
    Flat: [
      ['Entry Lobby', 0.07], ['Living', 0.16], ['Kitchen', 0.10], ['Bedroom', 0.14], ['Utility', 0.06], ['Balcony', 0.06], ['Parking', 0.18], ['Store', 0.05],
    ],
  };
  const factor = {
    'Independent House': 0.62,
    'Duplex House': 0.58,
    Villa: 0.68,
    Apartment: 0.52,
    Flat: 0.50,
  }[form.propertyType] || 0.60;
  const usableArea = Math.round(plotArea * factor);
  const roomDiagram = roomDistribution[form.propertyType] || roomDistribution['Independent House'];
  const roomCards = roomDiagram.map(([name, share]) => ({
    name,
    sqft: Math.max(40, Math.round(usableArea * share)),
    note: `${Math.round(share * 100)}% of usable house area`,
  }));

  const vehicleSlots = Number(form.parkingCars) + Number(form.parkingBikes) + Number(form.parkingEv);
  const parking = {
    slots: vehicleSlots,
    message: `Allocate ${form.parkingCars} car, ${form.parkingBikes} bike, and ${form.parkingEv} EV parking spots with 3.5 m turning radius.`,
  };
  const largestRoom = roomCards.reduce((best, room) => (room.sqft > best.sqft ? room : best), roomCards[0]);
  const smart = [
    `${form.propertyType} planning uses ${form.facing}-facing guidance to place the ${largestRoom.name.toLowerCase()} in the most breathable zone for better Vastu alignment.`,
    `Keep the kitchen in the ${rule.kitchen} zone and place the main bedroom in ${rule.bedroom} for stronger directional balance.`,
    `With a ${plotArea} sq ft plot and ${roomCards.length} planned zones, reserve ${Math.max(1, Math.round(usableArea * 0.08))} sq ft for circulation and ${Math.max(1, Math.round(usableArea * 0.12))} sq ft for open balcony or garden usage.`,
    `The current layout gives ${parking.slots} total vehicle slots, which is ideal for ${form.parkingCars} cars, ${form.parkingBikes} bikes, and ${form.parkingEv} EV charging points.`,
  ];

  return {
    plotArea,
    usableArea,
    roomDiagram: roomCards,
    largestRoom,
    vastu: {
      ...rule,
      warnings: ['Keep kitchen away from the main door for better airflow.', 'Maintain a clear pooja corner for sacred alignment.'],
      corrective: ['Use a small lobby to reduce direct light entry.', 'Shift the staircase to the side if the plot is narrow.'],
    },
    budget,
    parking,
    smart,
  };
}

function answerQuestion(question, form, analysis) {
  const q = String(question || '').toLowerCase();
  const budget = analysis.budget || {};
  const largestRoom = analysis.largestRoom || { name: 'Living Room', sqft: 0 };

  if (q.includes('parking')) {
    return `For your ${form.propertyType || 'home'} on a ${form.plotSize || '40x60'} plot, the planner suggests ${analysis.parking.slots} total vehicle slots. ${analysis.parking.message}`;
  }

  if (q.includes('budget') || q.includes('cost')) {
    return `The current estimate for ${form.propertyType || 'this plan'} is ₹${Math.round(budget.total || 0).toLocaleString()} in total, with ₹${Math.round(budget.cement || 0).toLocaleString()} for cement and ₹${Math.round(budget.steel || 0).toLocaleString()} for steel.`;
  }

  if (q.includes('vastu') || q.includes('direction') || q.includes('door') || q.includes('kitchen') || q.includes('bedroom')) {
    return `Vastu guidance for ${form.facing || 'this direction'} facing is: main door in ${analysis.vastu.mainDoor}, kitchen in ${analysis.vastu.kitchen}, and bedroom in ${analysis.vastu.bedroom}.`;
  }

  if (q.includes('room') || q.includes('sqft') || q.includes('area')) {
    return `The largest planned room is ${largestRoom.name} at ${largestRoom.sqft} sq ft. The usable house area is ${analysis.usableArea || 0} sq ft across ${analysis.roomDiagram?.length || 0} zones.`;
  }

  return `For your ${form.propertyType || 'home'} plan, the fastest suggestion is to keep the living and kitchen zones airy, reserve ${analysis.parking.slots || 0} parking slots, and use the ${analysis.vastu.mainDoor} main-door guidance for better Vastu balance.`;
}

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

app.listen(port, () => {
  console.log(`Smart home backend listening on http://localhost:${port}`);
});
