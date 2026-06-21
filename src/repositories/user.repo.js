const db = require('../config/db');

function findById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function findByPhone(phone) {
  return db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
}

function findByEmail(email) {
  if (!email) return null;
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function createUser({ fullName, phone, email, passwordHash, role = 'customer' }) {
  const stmt = db.prepare(`
    INSERT INTO users (full_name, phone, email, password_hash, role, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `);
  const result = stmt.run(fullName, phone, email || null, passwordHash, role);
  return findById(result.lastInsertRowid);
}

function findByGoogleId(googleId) {
  return db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
}

function findOrCreateGoogleUser({ googleId, fullName, email, avatarUrl }) {
  let user = findByGoogleId(googleId);
  if (user) return user;
  if (email) {
    user = findByEmail(email);
    if (user) {
      db.prepare('UPDATE users SET google_id = ?, avatar_url = ? WHERE id = ?').run(googleId, avatarUrl || null, user.id);
      return findById(user.id);
    }
  }
  const phone = 'google_' + googleId;
  const stmt = db.prepare(`
    INSERT INTO users (full_name, phone, email, password_hash, google_id, avatar_url, role, status)
    VALUES (?, ?, ?, '__google_no_password__', ?, ?, 'customer', 'active')
  `);
  const result = stmt.run(fullName, phone, email || null, googleId, avatarUrl || null);
  return findById(result.lastInsertRowid);
}

function findAllNonAdmin() {
  return db.prepare(`SELECT * FROM users WHERE role != 'admin' ORDER BY created_at DESC`).all();
}

function setStatus(id, status) {
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
}

function updatePhone(id, phone) {
  db.prepare('UPDATE users SET phone = ? WHERE id = ?').run(phone, id);
  return findById(id);
}

function updateProfile(id, { fullName, email }) {
  db.prepare('UPDATE users SET full_name = ?, email = ? WHERE id = ?')
    .run(fullName, email || null, id);
  return findById(id);
}

module.exports = {
  findById, findByPhone, findByEmail, createUser,
  findByGoogleId, findOrCreateGoogleUser,
  findAllNonAdmin, setStatus, updatePhone, updateProfile
};
