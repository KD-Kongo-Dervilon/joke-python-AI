// index.js

require('dotenv').config(); // Charger les variables d'environnement

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Joi = require('joi');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const path = require('path');

// Importer Sequelize et les modèles
const sequelize = require('./models/database');
const User = require('./models/User');
const Blague = require('./models/Blague');

// Importer le middleware d'authentification
const authenticate = require('./middlewares/authenticate');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Servir les fichiers statiques depuis 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Schéma de validation avec Joi pour les blagues
const blagueSchema = Joi.object({
    texte: Joi.string().min(10).max(500).required(),
    auteur: Joi.string().min(2).max(100).required(),
    categorie: Joi.string().valid('Animaux', 'Informatique', 'Autre').required()
});

// Schéma de validation avec Joi pour l'inscription
const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).max(100).required()
});

// Schéma de validation avec Joi pour la connexion
const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

// Routes d'Authentification

// POST /register - Inscription d'un nouvel utilisateur
app.post('/register', async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { username, password } = value;

        // Vérifier si l'utilisateur existe déjà
        const utilisateurExiste = await User.findOne({ where: { username } });
        if (utilisateurExiste) {
            return res.status(400).json({ message: 'Nom d\'utilisateur déjà pris.' });
        }

        // Créer un nouvel utilisateur
        const nouvelUtilisateur = await User.create({ username, password });

        res.status(201).json({ message: 'Utilisateur inscrit avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'inscription :', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription.' });
    }
});

// POST /login - Connexion d'un utilisateur
app.post('/login', async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { username, password } = value;

        // Trouver l'utilisateur
        const utilisateur = await User.findOne({ where: { username } });
        if (!utilisateur) {
            return res.status(400).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
        }

        // Vérifier le mot de passe
        const estValide = await utilisateur.comparePassword(password);
        if (!estValide) {
            return res.status(400).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect.' });
        }

        // Créer un token JWT
        const token = jwt.sign(
            { id: utilisateur.id, username: utilisateur.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
    }
});

// Routes CRUD pour les blagues

// GET /blagues - Récupère toutes les blagues avec pagination et filtres
// Exemple : /blagues?page=1&limit=10&categorie=Animaux&search=plongeurs
app.get('/blagues', async (req, res) => {
    try {
        let { page = 1, limit = 10, categorie, search } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        let filtres = {};

        if (categorie) {
            filtres.categorie = categorie;
        }

        if (search) {
            filtres = {
                ...filtres,
                [sequelize.Op.or]: [
                    { texte: { [sequelize.Op.like]: `%${search}%` } },
                    { auteur: { [sequelize.Op.like]: `%${search}%` } }
                ]
            };
        }

        const total = await Blague.count({ where: filtres });
        const blagues = await Blague.findAll({
            where: filtres,
            offset: (page - 1) * limit,
            limit: limit,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            page,
            limit,
            total,
            blagues
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des blagues :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des blagues.' });
    }
});

// GET /blagues/:id - Récupère une blague par son ID
app.get('/blagues/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const blague = await Blague.findByPk(id);
        if (blague) {
            res.json(blague);
        } else {
            res.status(404).json({ message: 'Blague non trouvée.' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de la blague :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération de la blague.' });
    }
});

// POST /blagues - Ajoute une nouvelle blague (Protégée)
app.post('/blagues', authenticate, async (req, res) => {
    try {
        const { error, value } = blagueSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { texte, auteur, categorie } = value;

        // Créer une nouvelle blague
        const nouvelleBlague = await Blague.create({ texte, auteur, categorie });

        res.status(201).json(nouvelleBlague);
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la blague :', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'ajout de la blague.' });
    }
});

// DELETE /blagues/:id - Supprime une blague par son ID (Protégée)
app.delete('/blagues/:id', authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        const blague = await Blague.findByPk(id);
        if (blague) {
            await blague.destroy();
            res.json({ message: 'Blague supprimée avec succès.' });
        } else {
            res.status(404).json({ message: 'Blague non trouvée.' });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de la blague :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression de la blague.' });
    }
});

// PUT /blagues/:id - Met à jour une blague par son ID (Protégée)
app.put('/blagues/:id', authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        const { error, value } = blagueSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { texte, auteur, categorie } = value;

        const blague = await Blague.findByPk(id);
        if (blague) {
            blague.texte = texte;
            blague.auteur = auteur;
            blague.categorie = categorie;
            await blague.save();
            res.json(blague);
        } else {
            res.status(404).json({ message: 'Blague non trouvée.' });
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la blague :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la blague.' });
    }
});

// Route pour générer une blague avec prompts dynamiques (Protégée)
app.post('/generate-joke', authenticate, async (req, res) => {
    try {
        const { categorie } = req.body;

        // Définir les catégories disponibles
        const categoriesDisponibles = ['Animaux', 'Informatique', 'Autre'];

        if (!categorie || !categoriesDisponibles.includes(categorie)) {
            return res.status(400).json({ message: `Veuillez sélectionner une catégorie valide : ${categoriesDisponibles.join(', ')}.` });
        }

        // Définir le prompt basé sur la catégorie
        let prompt = '';
        switch (categorie) {
            case 'Animaux':
                prompt = "Donne-moi une blague courte et amusante sur les animaux.";
                break;
            case 'Informatique':
                prompt = "Donne-moi une blague courte et amusante sur l'informatique.";
                break;
            case 'Autre':
                prompt = "Donne-moi une blague courte et amusante.";
                break;
            default:
                prompt = "Donne-moi une blague courte et amusante.";
        }

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100,
                temperature: 0.8, // Augmenter la température pour plus de variabilité
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        if (!response.data.choices || response.data.choices.length === 0) {
            throw new Error('Aucune réponse obtenue de l\'API OpenAI.');
        }

        const joke = response.data.choices[0].message.content.trim();

        // Créer une nouvelle blague
        const nouvelleBlague = await Blague.create({
            texte: joke,
            auteur: 'ChatGPT',
            categorie: categorie
        });

        res.status(201).json(nouvelleBlague);

    } catch (error) {
        console.error('Erreur lors de la génération de la blague avec ChatGPT :', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Erreur lors de la génération de la blague avec ChatGPT.' });
    }
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur.' });
});

// Synchroniser les modèles avec la base de données et démarrer le serveur
sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Erreur lors de la synchronisation de la base de données :', err);
    });