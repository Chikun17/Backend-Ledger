// src/controllers/transaction.controller.js
const { Transaction, Ledger, Account, sequelize } = require('../models');
const emailService = require('../services/email.service');

/**
 * Create a new transaction between two accounts.
 * Uses a Sequelize managed transaction to ensure atomicity.
 */
async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: 'FromAccount, toAccount, amount and idempotencyKey are required' });
  }

  const fromUserAccount = await Account.findOne({ where: { id: fromAccount } });
  const toUserAccount = await Account.findOne({ where: { id: toAccount } });
  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({ message: 'Invalid fromAccount or toAccount' });
  }

  const existingTx = await Transaction.findOne({ where: { idempotencyKey } });
  if (existingTx) {
    if (existingTx.status === 'COMPLETED') {
      return res.status(200).json({ message: 'Transaction already processed', transaction: existingTx });
    }
    if (existingTx.status === 'PENDING') {
      return res.status(200).json({ message: 'Transaction is still processing' });
    }
    return res.status(500).json({ message: 'Transaction previously failed, please retry' });
  }

  if (fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE') {
    return res.status(400).json({ message: 'Both fromAccount and toAccount must be ACTIVE to process transaction' });
  }

  const balance = await fromUserAccount.getBalance();
  if (balance < amount) {
    return res.status(400).json({ message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}` });
  }

  let transactionRecord;
  const t = await sequelize.transaction();
  try {
    transactionRecord = await Transaction.create({
      fromAccountId: fromAccount,
      toAccountId: toAccount,
      amount,
      idempotencyKey,
      status: 'PENDING',
    }, { transaction: t });

    await Ledger.create({
      accountId: fromAccount,
      amount,
      transactionId: transactionRecord.id,
      type: 'DEBIT',
    }, { transaction: t });

    await Ledger.create({
      accountId: toAccount,
      amount,
      transactionId: transactionRecord.id,
      type: 'CREDIT',
    }, { transaction: t });

    await transactionRecord.update({ status: 'COMPLETED' }, { transaction: t });
    await t.commit();
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ message: 'Transaction failed', error: err.message });
  }

  await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);
  return res.status(201).json({ message: 'Transaction completed successfully', transaction: transactionRecord });
}

/**
 * Create an initial funds transaction (system account to user account).
 */
async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: 'toAccount, amount and idempotencyKey are required' });
  }

  const toUserAccount = await Account.findOne({ where: { id: toAccount } });
  if (!toUserAccount) {
    return res.status(400).json({ message: 'Invalid toAccount' });
  }

  const fromUserAccount = await Account.findOne({ where: { userId: req.user.id } });
  if (!fromUserAccount) {
    return res.status(400).json({ message: 'System user account not found' });
  }

  const existingTx = await Transaction.findOne({ where: { idempotencyKey } });
  if (existingTx) {
    return res.status(200).json({ message: 'Transaction already processed', transaction: existingTx });
  }

  const t = await sequelize.transaction();
  try {
    const transactionRecord = await Transaction.create({
      fromAccountId: fromUserAccount.id,
      toAccountId: toAccount,
      amount,
      idempotencyKey,
      status: 'COMPLETED',
    }, { transaction: t });

    await Ledger.create({
      accountId: fromUserAccount.id,
      amount,
      transactionId: transactionRecord.id,
      type: 'DEBIT',
    }, { transaction: t });

    await Ledger.create({
      accountId: toAccount,
      amount,
      transactionId: transactionRecord.id,
      type: 'CREDIT',
    }, { transaction: t });

    await t.commit();
    return res.status(201).json({
      message: 'Initial funds transaction completed successfully',
      transaction: transactionRecord,
    });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ message: 'Initial funds transaction failed', error: err.message });
  }
}

module.exports = { createTransaction, createInitialFundsTransaction };
