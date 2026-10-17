// src/models/transaction.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Transaction extends Model {}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fromAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'accounts', key: 'id' },
    },
    toAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'accounts', key: 'id' },
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'REVERSED'),
      defaultValue: 'PENDING',
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: { min: 0 },
    },
    idempotencyKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: true,
  }
);

module.exports = Transaction;
