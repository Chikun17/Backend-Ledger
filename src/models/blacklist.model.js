// src/models/blacklist.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class TokenBlacklist extends Model {}

TokenBlacklist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'TokenBlacklist',
    tableName: 'token_blacklists',
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = TokenBlacklist;
