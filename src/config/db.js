// src/config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || '';

let sequelize;
if (DATABASE_URL) {
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );
}

const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established');
  } catch (err) {
    console.error('❌ Unable to connect to PostgreSQL:', err);
    process.exit(1);
  }
};

module.exports = { sequelize, connect };
