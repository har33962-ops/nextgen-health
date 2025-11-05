// db.js - seeds a small SQLite DB nextgen.db with tables and sample patients
const Database = require('better-sqlite3');
const db = new Database('./nextgen.db');

db.exec(`
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT,
  age INTEGER,
  contact TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  department TEXT,
  symptoms TEXT,
  preferredDoctor TEXT,
  preferredDate TEXT,
  status TEXT,
  patientId TEXT,
  assignedDoctor TEXT,
  notes TEXT,
  prescription TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appointmentId TEXT,
  rating INTEGER,
  comments TEXT,
  at TEXT
);
`);

const insert = db.prepare('INSERT OR IGNORE INTO patients (id,name,age,contact) VALUES (?,?,?,?)');
try {
  insert.run('u_1', 'Riya Sharma', 22, '+91-9876543210');
  insert.run('u_2', 'Aman Kumar', 23, '+91-9123456780');
} catch (e) { console.log(e) }

console.log('Database seeded (nextgen.db)');    
