const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'reservations.json');
// Vercel's production filesystem is read-only outside /tmp, and /tmp doesn't
// persist between function invocations. This file-based store works great
// in local dev (`vercel dev` or `node`), but for a real production deployment
// swap readStore/writeStore below for calls to a real database
// (Vercel KV, Supabase, Postgres, etc).
const TMP_FILE = '/tmp/coastal-care-reservations.json';

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    try {
      return JSON.parse(fs.readFileSync(TMP_FILE, 'utf8'));
    } catch (e2) {
      return [];
    }
  }
}

function writeStore(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    // Read-only filesystem (production) — fall back to /tmp.
    // NOTE: this is temporary storage only and will reset on cold start.
    fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2));
  }
}

const COTTAGES = ['Bakhaw Cottage', 'Bangus Cottage', 'Tahong Cottage'];
const MAX_GUESTS_PER_COTTAGE = 8;

module.exports = (req, res) => {
  const reservations = readStore();

  if (req.method === 'GET') {
    res.status(200).json(reservations);
    return;
  }

  if (req.method === 'POST') {
    const { name, contact, date, cottage, guests } = req.body || {};

    if (!name || !contact || !date || !cottage || !guests) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }
    if (!COTTAGES.includes(cottage)) {
      res.status(400).json({ error: 'Unknown cottage selected.' });
      return;
    }
    const guestCount = parseInt(guests, 10);
    if (isNaN(guestCount) || guestCount < 1 || guestCount > MAX_GUESTS_PER_COTTAGE) {
      res.status(400).json({ error: `Guests must be between 1 and ${MAX_GUESTS_PER_COTTAGE}.` });
      return;
    }

    const alreadyBooked = reservations.some(
      (r) => r.cottage === cottage && r.date === date
    );
    if (alreadyBooked) {
      res.status(409).json({ error: `${cottage} is already booked on ${date}. Please pick another date or cottage.` });
      return;
    }

    const newReservation = {
      id: Date.now(),
      name,
      contact,
      date,
      cottage,
      guests: guestCount,
      createdAt: new Date().toISOString(),
    };

    reservations.push(newReservation);
    writeStore(reservations);

    res.status(201).json(newReservation);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
