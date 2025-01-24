# Webscrapping Le Bahut

## Description

Une application Node.js utilisant Sequelize et SQLite pour gérer des blagues, avec un système d'authentification sécurisé et une intégration avec l'API OpenAI pour générer des blagues via ChatGPT.

## Fonctionnalités

- **Authentification Utilisateur** : Inscription et connexion sécurisées avec JWT.
- **Gestion des Blagues** : CRUD (Créer, Lire, Mettre à jour, Supprimer) pour les blagues.
- **Génération de Blagues** : Utilisation de l'API OpenAI pour générer des blagues dynamiques.
- **Sécurité** : Utilisation de Helmet et express-rate-limit pour sécuriser l'application.

## Installation

1. **Cloner le Dépôt**

    ```bash
    git clone https://github.com/votre_nom_utilisateur/webscrapping-le-bahut.git
    cd webscrapping-le-bahut
    ```

2. **Installer les Dépendances**

    ```bash
    npm install
    ```

3. **Configurer les Variables d'Environnement**

    Créez un fichier `.env` à la racine du projet et ajoutez les variables suivantes :

    ```env
    PORT=3000
    OPENAI_API_KEY=your_openai_api_key
    JWT_SECRET=your_jwt_secret_key
    ```

    **Remplacez** `your_openai_api_key` et `your_jwt_secret_key` par vos propres clés.

4. **Lancer l'Application**

    - **En Mode Développement :**

        ```bash
        npm run dev
        ```

    - **En Mode Production :**

        ```bash
        npm start
        ```

5. **Accéder à l'Application**

    Ouvrez votre navigateur et allez à [http://localhost:3000/](http://localhost:3000/).

## Utilisation

1. **Inscription**

    - Remplissez le formulaire d'inscription avec un nom d'utilisateur et un mot de passe.
    - Cliquez sur **"S'inscrire"**.

2. **Connexion**

    - Remplissez le formulaire de connexion avec vos identifiants.
    - Cliquez sur **"Se connecter"**.

3. **Gestion des Blagues**

    - **Ajouter une Blague** : Remplissez le formulaire avec le texte, l'auteur et la catégorie, puis cliquez sur **"Ajouter Blague"**.
    - **Modifier une Blague** : Cliquez sur le bouton **"Modifier"** correspondant à une blague, mettez à jour les informations, puis cliquez sur **"Sauvegarder les Modifications"**.
    - **Supprimer une Blague** : Cliquez sur le bouton **"Supprimer"** correspondant à une blague et confirmez la suppression.

4. **Génération de Blagues via ChatGPT**

    - Sélectionnez une catégorie et cliquez sur **"Générer Blague"** pour obtenir une nouvelle blague générée automatiquement.

## Technologies Utilisées

- **Backend :** Node.js, Express, Sequelize, SQLite
- **Frontend :** HTML, CSS, JavaScript
- **Sécurité :** JWT, bcrypt, Helmet, express-rate-limit
- **Intégration API :** OpenAI GPT-4

## Contribuer

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. **Fork le Dépôt**
2. **Créer une Branche** (`git checkout -b feature/AmazingFeature`)
3. **Committer vos Changements** (`git commit -m 'Add some AmazingFeature'`)
4. **Pousser vers la Branche** (`git push origin feature/AmazingFeature`)
5. **Ouvrir une Pull Request**

## Licence

Ce projet est sous la licence [MIT](LICENSE).

## Auteurs

- **Votre Nom** - *Développement initial* - [VotreProfilGitHub](https://github.com/votre_nom_utilisateur)

## Remerciements

- Merci à [OpenAI](https://openai.com/) pour l'API GPT-4.
- Merci à tous les contributeurs et à la communauté Node.js.# joke-python-AI
