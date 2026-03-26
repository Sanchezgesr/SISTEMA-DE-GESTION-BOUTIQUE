const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function init() {
  const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
  };

  const dbClient = new Client(dbConfig);

  try {
    await dbClient.connect();
    console.log(`Connected to ${process.env.DB_NAME}. Re-initializing schema...`);
    
    let sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
    
    // Clean SQL: remove database creation/selection commands
    sql = sql.replace(/CREATE DATABASE \w+;/g, '');
    sql = sql.replace(/\\c \w+;/g, '');
    sql = sql.replace(/--.*$/gm, ''); // remove comments
    
    // Split by semicolon, filter out empty, and execute each
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    // Optional: Drop existing tables to start fresh
    console.log('Cleaning old tables...');
    await dbClient.query('DROP TABLE IF EXISTS sale_details, purchase_details, product_variants, sales, purchases, products, categories, providers, users, expenses, settings, customers CASCADE');

    console.log('Executing new schema...');
    for (const statement of statements) {
      await dbClient.query(statement);
    }
    
    console.log('Database schema created successfully.');
  } catch (err) {
    console.error('Database initialization failed:', err);
  } finally {
    await dbClient.end();
  }
}

init();
