// public/script.js

document.addEventListener('DOMContentLoaded', () => {
    const blaguesTbody = document.getElementById('blagues-tbody');
    const blagueForm = document.getElementById('blague-form');
    const generateJokeBtn = document.getElementById('generate-joke-btn');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const filterCategorie = document.getElementById('filter-categorie');
    const pagination = document.getElementById('pagination');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const addBlagueSection = document.getElementById('add-blague-section');
    const authSection = document.getElementById('auth-section');
    const logoutSection = document.getElementById('logout-section');

    let currentPage = 1;
    const limit = 10; // Nombre de blagues par page
    let totalBlagues = 0;

    // Références des modales
    const editBlagueModal = new bootstrap.Modal(document.getElementById('editBlagueModal'));
    const editBlagueForm = document.getElementById('edit-blague-form');
    const editBlagueId = document.getElementById('edit-blague-id');
    const editTexte = document.getElementById('edit-texte');
    const editAuteur = document.getElementById('edit-auteur');
    const editCategorie = document.getElementById('edit-categorie');

    const readBlagueModal = new bootstrap.Modal(document.getElementById('readBlagueModal'));
    const readBlagueTexte = document.getElementById('read-blague-texte');
    const readBlagueAuteur = document.getElementById('read-blague-auteur');
    const readBlagueCategorie = document.getElementById('read-blague-categorie');

    // Fonction pour afficher un toast
    const showToast = (message, type = 'success') => {
        const toastContainer = document.querySelector('.toast-container');
        const toastEl = document.createElement('div');
        toastEl.classList.add('toast', 'align-items-center', 'text-bg-' + type, 'border-0');
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');

        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fermer"></button>
            </div>
        `;

        toastContainer.appendChild(toastEl);
        const bsToast = new bootstrap.Toast(toastEl, { delay: 3000 });
        bsToast.show();

        // Supprimer le toast après qu'il soit caché
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    };

    // Fonction pour récupérer le token depuis le stockage local
    const getToken = () => {
        return localStorage.getItem('token');
    };

    // Fonction pour vérifier si l'utilisateur est authentifié
    const isAuthenticated = () => {
        return !!getToken();
    };

    // Fonction pour mettre à jour l'interface utilisateur en fonction de l'authentification
    const updateUI = () => {
        if (isAuthenticated()) {
            authSection.classList.add('d-none');
            addBlagueSection.classList.remove('d-none');
            logoutSection.classList.remove('d-none');
        } else {
            authSection.classList.remove('d-none');
            addBlagueSection.classList.add('d-none');
            logoutSection.classList.add('d-none');
        }
    };

    // Fonction pour charger les blagues avec pagination et filtres
    const loadBlagues = (page = 1, categorie = '', search = '') => {
        let url = `/blagues?page=${page}&limit=${limit}`;
        if (categorie) {
            url += `&categorie=${encodeURIComponent(categorie)}`;
        }
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                afficherBlagues(data.blagues);
                afficherPagination(data.page, data.limit, data.total);
                totalBlagues = data.total;
            })
            .catch(error => {
                console.error('Erreur lors du chargement des blagues :', error);
                showToast('Erreur lors du chargement des blagues.', 'danger');
            });
    };

    // Fonction pour afficher les blagues dans la table
    const afficherBlagues = (blagues) => {
        blaguesTbody.innerHTML = ''; // Vider le tableau
        blagues.forEach(blague => {
            const tr = document.createElement('tr');

            // ID
            const tdId = document.createElement('td');
            tdId.textContent = blague.id;
            tr.appendChild(tdId);

            // Texte
            const tdTexte = document.createElement('td');
            tdTexte.textContent = blague.texte;
            tr.appendChild(tdTexte);

            // Auteur
            const tdAuteur = document.createElement('td');
            tdAuteur.textContent = blague.auteur;
            tr.appendChild(tdAuteur);

            // Catégorie
            const tdCategorie = document.createElement('td');
            tdCategorie.textContent = blague.categorie;
            tr.appendChild(tdCategorie);

            // Actions
            const tdActions = document.createElement('td');

            // Bouton Lire
            const readBtn = document.createElement('button');
            readBtn.innerHTML = '<i class="bi bi-eye"></i> Lire';
            readBtn.classList.add('btn', 'btn-sm', 'btn-info', 'me-2', 'read-btn');
            readBtn.addEventListener('click', () => lireBlague(blague));
            tdActions.appendChild(readBtn);

            // Bouton Modifier (visible uniquement pour les utilisateurs authentifiés)
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '<i class="bi bi-pencil-square"></i> Modifier';
            editBtn.classList.add('btn', 'btn-sm', 'btn-primary', 'me-2', 'edit-btn');
            editBtn.addEventListener('click', () => ouvrirModalModifier(blague));
            tdActions.appendChild(editBtn);

            // Bouton Supprimer (visible uniquement pour les utilisateurs authentifiés)
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i> Supprimer';
            deleteBtn.classList.add('btn', 'btn-sm', 'btn-danger', 'delete-btn');
            deleteBtn.addEventListener('click', () => deleteBlague(blague.id));
            tdActions.appendChild(deleteBtn);

            tr.appendChild(tdActions);
            blaguesTbody.appendChild(tr);
        });
    };

    // Fonction pour afficher la pagination
    const afficherPagination = (page, limit, total) => {
        pagination.innerHTML = ''; // Vider la pagination
        const totalPages = Math.ceil(total / limit);

        if (totalPages <= 1) return; // Pas besoin de pagination

        // Bouton Précédent
        const prevLi = document.createElement('li');
        prevLi.classList.add('page-item', page === 1 ? 'disabled' : '');
        const prevLink = document.createElement('a');
        prevLink.classList.add('page-link');
        prevLink.href = '#';
        prevLink.textContent = 'Précédent';
        prevLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (page > 1) {
                currentPage--;
                lancerRecherche();
            }
        });
        prevLi.appendChild(prevLink);
        pagination.appendChild(prevLi);

        // Pages
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.classList.add('page-item', i === page ? 'active' : '');
            const link = document.createElement('a');
            link.classList.add('page-link');
            link.href = '#';
            link.textContent = i;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                lancerRecherche();
            });
            li.appendChild(link);
            pagination.appendChild(li);
        }

        // Bouton Suivant
        const nextLi = document.createElement('li');
        nextLi.classList.add('page-item', page === totalPages ? 'disabled' : '');
        const nextLink = document.createElement('a');
        nextLink.classList.add('page-link');
        nextLink.href = '#';
        nextLink.textContent = 'Suivant';
        nextLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (page < totalPages) {
                currentPage++;
                lancerRecherche();
            }
        });
        nextLi.appendChild(nextLink);
        pagination.appendChild(nextLi);
    };

    // Fonction pour ajouter une nouvelle blague
    blagueForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const texte = document.getElementById('texte').value.trim();
        const auteur = document.getElementById('auteur').value.trim();
        const categorie = document.getElementById('categorie').value.trim();

        if (texte === '' || auteur === '' || categorie === '') {
            showToast('Veuillez remplir tous les champs.', 'warning');
            return;
        }

        fetch('/blagues', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ texte, auteur, categorie })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => { throw new Error(data.message); });
            }
            return response.json();
        })
        .then(data => {
            blagueForm.reset();
            currentPage = 1;
            lancerRecherche();
            showToast('Blague ajoutée avec succès !');
        })
        .catch(error => {
            showToast(`Erreur : ${error.message}`, 'danger');
        });
    });

    // Fonction pour supprimer une blague
    const deleteBlague = (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette blague ?')) return;

        fetch(`/blagues/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => { throw new Error(data.message); });
            }
            return response.json();
        })
        .then(data => {
            lancerRecherche();
            showToast('Blague supprimée avec succès !');
        })
        .catch(error => {
            showToast(`Erreur : ${error.message}`, 'danger');
        });
    };

    // Fonction pour ouvrir la modal de modification
    const ouvrirModalModifier = (blague) => {
        editBlagueId.value = blague.id;
        editTexte.value = blague.texte;
        editAuteur.value = blague.auteur;
        editCategorie.value = blague.categorie;
        editBlagueModal.show();
    };

    // Gestion de la soumission de la modal de modification
    editBlagueForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = editBlagueId.value;
        const texte = editTexte.value.trim();
        const auteur = editAuteur.value.trim();
        const categorie = editCategorie.value.trim();

        if (texte === '' || auteur === '' || categorie === '') {
            showToast('Les champs texte, auteur et catégorie ne peuvent pas être vides.', 'warning');
            return;
        }

        fetch(`/blagues/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ texte, auteur, categorie })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => { throw new Error(data.message); });
            }
            return response.json();
        })
        .then(data => {
            editBlagueModal.hide();
            lancerRecherche();
            showToast('Blague mise à jour avec succès !');
        })
        .catch(error => {
            showToast(`Erreur : ${error.message}`, 'danger');
        });
    });

    // Fonction pour générer une blague avec ChatGPT
    generateJokeBtn.addEventListener('click', () => {
        // Récupérer la catégorie sélectionnée pour la génération
        const categorie = document.getElementById('categorie').value.trim();

        if (categorie === '') {
            showToast('Veuillez sélectionner une catégorie pour générer une blague.', 'warning');
            return;
        }

        // Indiquer que la génération est en cours
        generateJokeBtn.disabled = true;
        generateJokeBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Génération...';

        fetch('/generate-joke', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ categorie })
        })
        .then(response => {
            generateJokeBtn.disabled = false;
            generateJokeBtn.innerHTML = '<i class="bi bi-journal-plus"></i> Générer Blague';
            if (!response.ok) {
                return response.json().then(data => { throw new Error(data.message); });
            }
            return response.json();
        })
        .then(data => {
            currentPage = 1;
            lancerRecherche();
            showToast('Nouvelle blague générée et ajoutée !');
        })
        .catch(error => {
            generateJokeBtn.disabled = false;
            generateJokeBtn.innerHTML = '<i class="bi bi-journal-plus"></i> Générer Blague';
            showToast(`Erreur : ${error.message}`, 'danger');
        });
    });

    // Fonctionnalité de Recherche et Filtrage avec Bouton
    const lancerRecherche = () => {
        const searchQuery = searchInput.value.trim();
        const categorieFilter = filterCategorie.value.trim();
        currentPage = 1; // Réinitialiser à la première page lors d'une nouvelle recherche
        loadBlagues(currentPage, categorieFilter, searchQuery);
    };

    // Événement pour le bouton de recherche
    searchBtn.addEventListener('click', lancerRecherche);

    // Optionnel : Lancer la recherche lorsqu'on appuie sur "Entrée" dans le champ de recherche
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            lancerRecherche();
        }
    });

    // Événement pour le filtre de catégorie
    filterCategorie.addEventListener('change', () => {
        lancerRecherche();
    });

    // Fonction pour lire une blague
    const lireBlague = (blague) => {
        readBlagueTexte.textContent = blague.texte;
        readBlagueAuteur.textContent = blague.auteur;
        readBlagueCategorie.textContent = blague.categorie;
        readBlagueModal.show();
    };

    // Fonction pour gérer l'inscription
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value.trim();

        if (username === '' || password === '') {
            showToast('Veuillez remplir tous les champs d\'inscription.', 'warning');
            return;
        }

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => { throw new Error(data.message); });
            }
            return response.json();
        })
        .then(data => {
            registerForm.reset();
            showToast('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success');
        })
        .catch(error => {
            showToast(`Erreur : ${error.message}`, 'danger');
        });
    });

    // Fonction pour gérer la connexion
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (username === '' || password === '') {
            showToast('Veuillez remplir tous les champs de connexion.', 'warning');
            return;
        }

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => { throw new Error(data.message); });
            }
            return response.json();
        })
        .then(data => {
            // Stocker le token dans le stockage local
            localStorage.setItem('token', data.token);
            loginForm.reset();
            updateUI();
            showToast('Connexion réussie !', 'success');
            lancerRecherche(); // Charger les blagues après connexion
        })
        .catch(error => {
            showToast(`Erreur : ${error.message}`, 'danger');
        });
    });

    // Fonction pour gérer la déconnexion
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        updateUI();
        showToast('Déconnexion réussie !', 'success');
        loadBlagues(); // Recharger les blagues sans authentification
    });

    // Charger les blagues avec les paramètres actuels
    const initialLoad = () => {
        const token = getToken();
        if (token) {
            updateUI();
            lancerRecherche();
        } else {
            loadBlagues(currentPage);
        }
    };

    // Charger les blagues au chargement de la page
    initialLoad();
});