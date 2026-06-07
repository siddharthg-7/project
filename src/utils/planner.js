const VASTU_RULES = {
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

export const DEFAULT_FORM = {
  propertyType: 'Independent House',
  plotSize: '40x60 yards',
  plotShape: 'Rectangular',
  facing: 'East',
  floors: '2',
  rooms: '3',
  houseType: '3BHK',
  apartmentType: '2BHK',
  parkingCars: 2,
  parkingBikes: 3,
  parkingEv: 1,
};

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizePlotSize(plotSize) {
  return String(plotSize || '40x60')
    .replace(/\s*yards?/i, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

export function estimateBudget(form = {}) {
  const normalized = normalizePlotSize(form.plotSize);
  const [rawWidth, rawHeight] = normalized.split('x');
  const width = safeNumber(rawWidth, 40);
  const height = safeNumber(rawHeight, 60);
  const area = width * height;
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
  const parking = (safeNumber(form.parkingCars) + safeNumber(form.parkingBikes) * 0.6 + safeNumber(form.parkingEv) * 2) * 350000;
  const total = cement + steel + bricks + labour + flooring + parking;
  return { cement, steel, bricks, labour, flooring, parking, total };
}

export function analyzePlan(form = {}) {
  const rule = VASTU_RULES[form.facing] || VASTU_RULES.North;
  const budget = estimateBudget(form);
  const normalized = normalizePlotSize(form.plotSize);
  const [rawWidth, rawHeight] = normalized.split('x');
  const width = safeNumber(rawWidth, 40);
  const height = safeNumber(rawHeight, 60);
  const plotArea = width * height;

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

  const vehicleSlots = safeNumber(form.parkingCars) + safeNumber(form.parkingBikes) + safeNumber(form.parkingEv);
  const parking = {
    slots: vehicleSlots,
    message: `Allocate ${safeNumber(form.parkingCars)} car, ${safeNumber(form.parkingBikes)} bike, and ${safeNumber(form.parkingEv)} EV parking spots with 3.5 m turning radius.`,
  };
  const largestRoom = roomCards.reduce((best, room) => (room.sqft > best.sqft ? room : best), roomCards[0] || { name: 'Living Room', sqft: 0 });
  const circulationArea = Math.max(1, Math.round(usableArea * 0.08));
  const openArea = Math.max(1, Math.round(usableArea * 0.12));

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
    smart: [
      `${form.propertyType || 'This'} planning uses ${form.facing || 'this'}-facing guidance to place the ${largestRoom.name.toLowerCase()} in the most breathable zone for better Vastu alignment.`,
      `Keep the kitchen in the ${rule.kitchen} zone and place the main bedroom in ${rule.bedroom} for stronger directional balance.`,
      `With a ${plotArea} sq ft plot and ${roomCards.length} planned zones, reserve ${circulationArea} sq ft for circulation and ${openArea} sq ft for open balcony or garden usage.`,
      `The current layout gives ${parking.slots} total vehicle slots, which is ideal for ${safeNumber(form.parkingCars)} cars, ${safeNumber(form.parkingBikes)} bikes, and ${safeNumber(form.parkingEv)} EV charging points.`,
    ],
  };
}

export function answerQuestion(question, form = {}, analysis = analyzePlan(form)) {
  const q = String(question || '').toLowerCase();
  const budget = analysis.budget || {};
  const largestRoom = analysis.largestRoom || { name: 'Living Room', sqft: 0 };

  if (q.includes('parking')) {
    return `For your ${form.propertyType || 'home'} on a ${form.plotSize || '40x60'} plot, the planner suggests ${analysis.parking?.slots || 0} total vehicle slots. ${analysis.parking?.message || ''}`;
  }

  if (q.includes('budget') || q.includes('cost')) {
    return `The current estimate for ${form.propertyType || 'this plan'} is ₹${Math.round(budget.total || 0).toLocaleString()} in total, with ₹${Math.round(budget.cement || 0).toLocaleString()} for cement and ₹${Math.round(budget.steel || 0).toLocaleString()} for steel.`;
  }

  if (q.includes('vastu') || q.includes('direction') || q.includes('door') || q.includes('kitchen') || q.includes('bedroom')) {
    return `Vastu guidance for ${form.facing || 'this direction'} facing is: main door in ${analysis.vastu?.mainDoor || 'North-East quadrant'}, kitchen in ${analysis.vastu?.kitchen || 'South-East'}, and bedroom in ${analysis.vastu?.bedroom || 'South-West'}.`;
  }

  if (q.includes('room') || q.includes('sqft') || q.includes('area')) {
    return `The largest planned room is ${largestRoom.name} at ${largestRoom.sqft} sq ft. The usable house area is ${analysis.usableArea || 0} sq ft across ${analysis.roomDiagram?.length || 0} zones.`;
  }

  return `For your ${form.propertyType || 'home'} plan, the fastest suggestion is to keep the living and kitchen zones airy, reserve ${analysis.parking?.slots || 0} parking slots, and use the ${analysis.vastu?.mainDoor || 'North-East quadrant'} main-door guidance for better Vastu balance.`;
}

export function loadJson(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveJson(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function clearJson(key) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

export function getMockSession() {
  return loadJson('authSession', null);
}

export function setMockSession(session) {
  saveJson('authSession', session);
}

export function clearMockSession() {
  clearJson('authSession');
}
