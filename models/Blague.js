// models/Blague.js

const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Blague = sequelize.define('Blague', {
    texte: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [10, 500],
        },
    },
    auteur: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 100],
        },
    },
    categorie: {
        type: DataTypes.ENUM('Animaux', 'Informatique', 'Autre'),
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = Blague;