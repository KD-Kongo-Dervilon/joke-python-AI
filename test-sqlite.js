// test-sqlite.js

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        return console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
    }
    console.log('Connexion réussie à la base de données SQLite en mémoire.');
});

db.serialize(() => {
    db.run("CREATE TABLE test (id INT, name TEXT)", (err) => {
        if (err) {
            return console.error('Erreur lors de la création de la table:', err.message);
        }
        console.log('Table créée avec succès.');
    });

    db.run("INSERT INTO test (id, name) VALUES (?, ?)", [1, 'John Doe'], function(err) {
        if (err) {
            return console.error('Erreur lors de l\'insertion:', err.message);
        }
        console.log(`Une ligne a été insérée avec l'ID ${this.lastID}.`);
    });

    db.each("SELECT id, name FROM test", (err, row) => {
        if (err) {
            return console.error('Erreur lors de la sélection:', err.message);
        }
        console.log(`ID: ${row.id}, Nom: ${row.name}`);
    });
});

db.close((err) => {
    if (err) {
        return console.error('Erreur lors de la fermeture de la base de données:', err.message);
    }
    console.log('Base de données SQLite fermée.');
});