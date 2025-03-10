const { sequelize } = require('../config/database');
const User = require('./User');
const Business = require('./Business');
const Branch = require('./Branch');
const Category = require('./Category');
const Dish = require('./Dish');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const CashRegister = require('./CashRegister');

// Definición de relaciones entre modelos
User.hasMany(Business, { foreignKey: 'ownerId' });
Business.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Business.hasMany(Branch, { foreignKey: 'businessId' });
Branch.belongsTo(Business, { foreignKey: 'businessId' });

Branch.hasMany(Category, { foreignKey: 'branchId' });
Category.belongsTo(Branch, { foreignKey: 'branchId' });

Category.hasMany(Dish, { foreignKey: 'categoryId' });
Dish.belongsTo(Category, { foreignKey: 'categoryId' });

Branch.hasMany(Order, { foreignKey: 'branchId' });
Order.belongsTo(Branch, { foreignKey: 'branchId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Dish.hasMany(OrderItem, { foreignKey: 'dishId' });
OrderItem.belongsTo(Dish, { foreignKey: 'dishId' });

Order.hasOne(Payment, { foreignKey: 'orderId' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });

Branch.hasMany(CashRegister, { foreignKey: 'branchId' });
CashRegister.belongsTo(Branch, { foreignKey: 'branchId' });

module.exports = {
  sequelize,
  User,
  Business,
  Branch,
  Category,
  Dish,
  Order,
  OrderItem,
  Payment,
  CashRegister
};
