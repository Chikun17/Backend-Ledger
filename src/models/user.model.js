// src/models/user.model.js
const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

class User extends Model {
  async comparePassword(password) {
    return await bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: 'Email already exists.' },
      validate: {
        isEmail: { msg: 'Invalid Email address' },
        notEmpty: { msg: 'Email is required for creating a user' },
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Name is required for creating an account' } },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: { args: [6], msg: 'password should contain more than 6 character' } },
    },
    systemUser: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
    defaultScope: { attributes: { exclude: ['password'] } },
    scopes: { withPassword: { attributes: { include: ['password'] } } },
  }
);

module.exports = User;
