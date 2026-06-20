const fs = require('fs');
const path = require('path');
const db = require('../config/db');

function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('✔ Database schema applied successfully.');

  try {
    db.exec('ALTER TABLE products ADD COLUMN product_attributes TEXT');
    console.log('✔ Added product_attributes column to products table.');
  } catch (e) {
    // Column already exists — safe to ignore
  }

  // Personal listings (customer P2P / classifieds)
  db.exec(`
    CREATE TABLE IF NOT EXISTS personal_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      category_id INTEGER REFERENCES categories(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL DEFAULT 0 CHECK (price >= 0),
      listing_attributes TEXT DEFAULT '{}',
      status TEXT NOT NULL CHECK (status IN ('active','inactive','sold')) DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS personal_listing_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL REFERENCES personal_listings(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);
  console.log('✔ Personal listings tables ready.');

  try {
    db.exec('ALTER TABLE stores ADD COLUMN shipping_fee REAL NOT NULL DEFAULT 0');
    console.log('✔ Added shipping_fee column to stores table.');
  } catch (e) {}

  // Banner ads table
  db.exec(`
    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      link_url TEXT,
      image_url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('✔ Banners table ready.');

  // Chat moderation: flagged conversations
  try {
    db.exec('ALTER TABLE conversations ADD COLUMN is_flagged INTEGER NOT NULL DEFAULT 0');
    console.log('✔ Added is_flagged column to conversations.');
  } catch (e) {}

  try {
    db.exec('ALTER TABLE conversations ADD COLUMN flagged_reason TEXT');
    console.log('✔ Added flagged_reason column to conversations.');
  } catch (e) {}
}

migrate();
