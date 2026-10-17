// src/models/ledger.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Ledger extends Model {}

Ledger.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'accounts', key: 'id' },
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    transactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'transactions', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM('CREDIT', 'DEBIT'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Ledger',
    tableName: 'ledgers',
    timestamps: true,
    hooks: {
      beforeUpdate: () => { throw new Error('Ledger entries are immutable and cannot be modified'); },
      beforeDestroy: () => { throw new Error('Ledger entries are immutable and cannot be deleted'); },
    },
  }
);

module.exports = Ledger;
