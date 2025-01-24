// models/database.js

const { Sequelize } = require('sequelize');
const path = require('path');

// Initialiser Sequelize avec SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false, // Désactiver les logs SQL (optionnel)
});

module.exports = sequelize;