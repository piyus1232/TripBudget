import fs from 'fs';
import path from 'path';

const DIR = path.join(process.cwd(), '.cache');
const FILE = path.join(DIR, 'plan-cache.json');

function readStore() {
  try {
    if (!fs.existsSync(FILE))
      return { train: {}, hotels: {}, places: {}, full: {} };
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return { train: {}, hotels: {}, places: {}, full: {} };
  }
}

function writeStore(store) {
  try {
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(store), 'utf8');
  } catch (e) {
    console.warn('planCacheDisk write:', e.message);
  }
}

/** Calendar date only — avoids timezone changing the day vs new Date().toISOString() */
export function cacheDateKey(input) {
  if (input == null) return '';
  const s = String(input).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[0];
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s.slice(0, 10);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

export function stableClassKey(classCodes) {
  return [...(classCodes || ['SL'])].map(String).sort().join(',');
}

const store = readStore();
if (!store.full) store.full = {};
const maxAge = (ttlSec) => ttlSec * 1000;

export function diskTrainGet(key, ttlSec) {
  const e = store.train[key];
  if (!e || Date.now() - e.savedAt > maxAge(ttlSec)) return null;
  return e.payload;
}

export function diskTrainSet(key, payload, ttlSec) {
  store.train[key] = { savedAt: Date.now(), payload };
  prune(store.train, ttlSec);
  writeStore(store);
}

export function diskHotelsGet(key, ttlSec) {
  const e = store.hotels[key];
  if (!e || Date.now() - e.savedAt > maxAge(ttlSec)) return null;
  return e.payload;
}

export function diskHotelsSet(key, payload, ttlSec) {
  store.hotels[key] = { savedAt: Date.now(), payload };
  prune(store.hotels, ttlSec);
  writeStore(store);
}

export function diskPlacesGet(key, ttlSec) {
  const e = store.places[key];
  if (!e || Date.now() - e.savedAt > maxAge(ttlSec)) return null;
  return e.payload;
}

export function diskPlacesSet(key, payload, ttlSec) {
  store.places[key] = { savedAt: Date.now(), payload };
  prune(store.places, ttlSec);
  writeStore(store);
}

export function diskFullGet(key, ttlSec) {
  const e = store.full[key];
  if (!e || Date.now() - e.savedAt > maxAge(ttlSec)) return null;
  return e.payload;
}

export function diskFullSet(key, payload, ttlSec) {
  store.full[key] = { savedAt: Date.now(), payload };
  prune(store.full, ttlSec);
  writeStore(store);
}

function prune(bucket, ttlSec) {
  const t = Date.now();
  for (const k of Object.keys(bucket)) {
    if (t - bucket[k].savedAt > maxAge(ttlSec)) delete bucket[k];
  }
}
