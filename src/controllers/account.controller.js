// src/controllers/account.controller.js
const { Account } = require('../models');

/** Create a new account for the authenticated user */
async function createAccountController(req, res) {
  const user = req.user;
  const account = await Account.create({ userId: user.id });
  res.status(201).json({ account });
}

/** Get all accounts belonging to the authenticated user */
async function getUserAccountsController(req, res) {
  const accounts = await Account.findAll({ where: { userId: req.user.id } });
  res.status(200).json({ accounts });
}

/** Get balance for a specific account (must belong to user) */
async function getAccountBalanceController(req, res) {
  const { accountId } = req.params;
  const account = await Account.findOne({ where: { id: accountId, userId: req.user.id } });
  if (!account) {
    return res.status(404).json({ message: 'Account not found' });
  }
  const balance = await account.getBalance();
  res.status(200).json({ accountId: account.id, balance });
}

module.exports = {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController,
};
