// src/models/index.js
const { sequelize } = require('../config/db');
const User = require('./user.model');
const Account = require('./account.model');
const Ledger = require('./ledger.model');
const Transaction = require('./transaction.model');
const TokenBlacklist = require('./blacklist.model');

// Associations
User.hasMany(Account, { foreignKey: 'userId', as: 'accounts' });
Account.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Account.hasMany(Ledger, { foreignKey: 'accountId', as: 'ledgers' });
Ledger.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });
Transaction.belongsTo(Account, { foreignKey: 'fromAccountId', as: 'fromAccount' });
Transaction.belongsTo(Account, { foreignKey: 'toAccountId', as: 'toAccount' });
Ledger.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

module.exports = {
  sequelize,
  User,
  Account,
  Ledger,
  Transaction,
  TokenBlacklist,
};
