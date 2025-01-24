// middlewares/authenticate.js

const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token JWT
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format : "Bearer TOKEN"

    if (!token) return res.status(401).json({ message: 'Accès refusé. Token manquant.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token invalide.' });
        req.user = user; // Ajouter l'utilisateur au contexte de la requête
        next();
    });
};

module.exports = authenticate;