// src/models/account.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Account extends Model {
  async getBalance() {
    const Ledger = require('./ledger.model');
    const result = await Ledger.findAll({
      where: { accountId: this.id },
      attributes: [
        [sequelize.fn('SUM', sequelize.literal(`CASE WHEN "type" = 'DEBIT' THEN amount ELSE 0 END`)), 'totalDebit'],
        [sequelize.fn('SUM', sequelize.literal(`CASE WHEN "type" = 'CREDIT' THEN amount ELSE 0 END`)), 'totalCredit'],
      ],
      raw: true,
    });
    const { totalDebit = 0, totalCredit = 0 } = result[0] || {};
    return Number(totalCredit) - Number(totalDebit);
  }
}

Account.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'FROZEN', 'CLOSED'),
      defaultValue: 'ACTIVE',
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'INR',
    },
  },
  {
    sequelize,
    modelName: 'Account',
    tableName: 'accounts',
    timestamps: true,
    indexes: [{ fields: ['userId', 'status'] }],
  }
);

module.exports = Account;
