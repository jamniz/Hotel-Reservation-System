document.addEventListener("DOMContentLoaded", async () => {
    // --- ÉLÉMENTS DOM POUR LES FILTRES ET L'AFFICHAGE ---
    const roomsList = document.getElementById("roomsList");
    const filterTypeSelect = document.getElementById("filterType");
    const filterAccessibilitySelect = document.getElementById("filterAccessibility");
    const filterPriceMaxInput = document.getElementById("filterPriceMax");
    const priceValueSpan = document.getElementById("priceValue");
    const filterSortPriceSelect = document.getElementById("filterSortPrice");
    const filterCheckInDateInput = document.getElementById("filterCheckInDate");
    const filterCheckOutDateInput = document.getElementById("filterCheckOutDate");
    const roomFilterForm = document.getElementById("roomFilterForm");

    // Récupération des boutons de connexion/déconnexion
    const registerBtn = document.getElementById("registerBtn");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const reservationForm = document.getElementById("reservationForm"); // Formulaire POST de réservation

    // Variables d'état globales
    let currentUserRole = null;
    let currentUsername = null;

    // Initialisation au chargement
    updateConnectionStatus(null); // Met à jour l'affichage de l'utilisateur connecté

    // --- Fonctions utilitaires ---

    function showAlert(message, type = "success") {
        const alertBox = document.getElementById("alertBox");
        if (alertBox) {
            alertBox.textContent = message;
            alertBox.style.display = "block";

            if (type === "success") {
                alertBox.style.backgroundColor = "#dff0d8";
                alertBox.style.color = "#3c763d";
                alertBox.style.borderColor = "#d6e9c6";
            } else if (type === "error") {
                alertBox.style.backgroundColor = "#f2dede";
                alertBox.style.color = "#a94442";
                alertBox.style.borderColor = "#ebccd1";
            } else if (type === "info") {
                alertBox.style.backgroundColor = "#d9edf7";
                alertBox.style.color = "#31708f";
                alertBox.style.borderColor = "#bce8f1";
            } else {
                alertBox.style.backgroundColor = "#f0f0f0";
                alertBox.style.color = "#333";
                alertBox.style.borderColor = "#ccc";
            }

            setTimeout(() => {
                alertBox.style.display = "none";
            }, 10000);
        } else {
            console.warn("L'élément #alertBox n'a pas été trouvé. Utilisation de alert() par défaut.");
            alert(message);
        }
    }

    // Fonction pour mettre à jour l'affichage de l'état de connexion
    function updateConnectionStatus(username) {
        const userConnectedElement = document.getElementById("userConnected");
        const authButtonsDiv = document.getElementById("authButtons");
        if (userConnectedElement && authButtonsDiv) {
            userConnectedElement.innerHTML = username ? `Bienvenue ${username} !` : "";

            if (username) {
                loginBtn.style.display = "none";
                registerBtn.style.display = "none";
                logoutBtn.style.display = "inline-block";
            } else {
                loginBtn.style.display = "inline-block";
                registerBtn.style.display = "inline-block";
                logoutBtn.style.display = "none";
            }
        }
    }

    // Réinitialisation le formulaire de réservation
    function resetReservationForm() {
        if (reservationForm) {
            reservationForm.reset();
        }
    }

    // Réinitialisation filtres/dates :
    function resetDateFilters() {
        const filterCheckInDateInput = document.getElementById('filterCheckInDate');
        const filterCheckOutDateInput = document.getElementById('filterCheckOutDate');

        if (filterCheckInDateInput) {
            filterCheckInDateInput.value = ''; // Vide le champ de date d'arrivée
        }
        if (filterCheckOutDateInput) {
            filterCheckOutDateInput.value = ''; // Vide le champ de date de départ
        }
        console.log("Filtres de dates réinitialisés.");
    }

    // --- Fonctions d'affichage et de récupération ---

    // Fonction pour afficher les chambres 
    function displayRooms(chambres) {
        if (!roomsList) return;

        roomsList.innerHTML = "";
        if (chambres.length === 0) {
            roomsList.innerHTML = "<p>Aucune chambre trouvée avec ces critères.</p>";
            return;
        }
        chambres.forEach(room => {
            const li = document.createElement("li");
            li.textContent = `Chambre ${room.roomNumber} - Type: ${room.type} - Prix: ${room.price}€/nuit (Accessible: ${room.accessibility ? 'Oui' : 'Non'})`;
            roomsList.appendChild(li);
        });
    }

    // Fonction pour récupérer les chambres
    async function fetchRooms(event) {
        if (event) event.preventDefault();

        // Récupération des valeurs des filtres 
        const type = filterTypeSelect ? filterTypeSelect.value : '';
        const accessibility = filterAccessibilitySelect ? filterAccessibilitySelect.value : '';
        const priceMax = filterPriceMaxInput ? filterPriceMaxInput.value : '';
        const sortPrice = filterSortPriceSelect ? filterSortPriceSelect.value : '';
        const checkInDate = filterCheckInDateInput ? filterCheckInDateInput.value : '';
        const checkOutDate = filterCheckOutDateInput ? filterCheckOutDateInput.value : '';


        let url = "/api/v1/rooms"; // URL par défaut
        let params = new URLSearchParams();

        // Ajout des filtres aux paramètres si non vides
        if (type) params.append("type", type);
        if (accessibility) params.append("accessibility", accessibility);
        if (priceMax) params.append("priceMax", priceMax);
        if (sortPrice) params.append("sort", sortPrice);

        // Logique pour utiliser la route de disponibilité si les dates sont renseignées
        if (checkInDate && checkOutDate) {
            params.append("checkInDate", checkInDate);
            params.append("checkOutDate", checkOutDate);
            url = "/api/v1/rooms/available";
        }
        // else: L'URL reste "/api/v1/rooms" par défaut si les dates ne sont pas renseignées

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        try {
            const response = await fetch(url, {
                method: "GET",
                credentials: "include"
            });

            if (!response.ok) {
                console.error(`Erreur HTTP lors de la récupération des chambres: ${response.status}`);
                const errorData = await response.json().catch(() => ({ message: `Statut ${response.status}: ${response.statusText}` }));
                showAlert(`Erreur lors de la récupération des chambres: ${errorData.message}`, "error");
                // IMPORTANT: Afficher un tableau vide en cas d'erreur pour vider l'ancienne liste
                displayRooms([]);
                return;
            }
            const rooms = await response.json();
            displayRooms(rooms);
        } catch (error) {
            console.error("Erreur lors de la récupération des chambres :", error);
            showAlert("Erreur réseau ou inattendue lors de la récupération des chambres.", "error");
            displayRooms([]); // Afficher un tableau vide en cas d'erreur réseau
        }
    }

    // Fonction pour afficher les réservations
    function displayReservations(reservations) {
        const reservationsList = document.getElementById("reservationsList");
        if (!reservationsList) {
            console.warn("L'élément #reservationsList n'a pas été trouvé. Les réservations ne seront pas affichées.");
            return;
        }

        reservationsList.innerHTML = "";

        if (reservations.length === 0) {
            reservationsList.innerHTML = "<p>Aucune réservation trouvée.</p>";
            return;
        }

        reservations.forEach(res => {
            const li = document.createElement("li");

            const displayedRoomInfo = res.roomId && res.roomId.roomNumber
                ? `Chambre ${res.roomId.roomNumber} (${res.roomId.type || 'N/A'})`
                : 'Chambre N/A';

            const createdByInfo = res.createdBy && res.createdBy.username
                ? ` (créée par : ${res.createdBy.username})` // Ou res.createdBy.email
                : ''; // Si non populé ou pas d'info

            const specialRequestsInfo = res.specialRequests
                ? `<br>Requêtes spéciales : ${res.specialRequests}`
                : ''; // Si le champ est vide ou null, n'affiche rien

            let reservationDetails = `
            <strong>${displayedRoomInfo}</strong><br>
            Client: ${res.customerName || 'N/A'}<br>
            Période: ${new Date(res.checkInDate).toLocaleDateString()} au ${new Date(res.checkOutDate).toLocaleDateString()}<br>
            Statut: ${res.status}
            ${specialRequestsInfo} 
        `;

            li.innerHTML = reservationDetails;

            if (currentUserRole === 'admin') {
                const modifyBtn = document.createElement("button");
                modifyBtn.textContent = "Modifier";
                modifyBtn.style.marginLeft = "10px";
                modifyBtn.addEventListener("click", () => handleModifyReservation(res._id, res));
                li.appendChild(modifyBtn);

                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Supprimer";
                deleteBtn.style.marginLeft = "5px";
                deleteBtn.addEventListener("click", () => handleDeleteReservation(res._id));
                li.appendChild(deleteBtn);
            }

            reservationsList.appendChild(li);
        });
    }

    // Fonction pour récupérer les réservations (GET)
    async function fetchReservations() {
        if (!currentUserRole) {
            console.log("Utilisateur non connecté ou rôle non défini, impossible de récupérer les réservations.");
            showAlert("Veuillez vous connecter pour voir vos réservations.", "info");
            displayReservations([]);
            return;
        }

        let endpoint;
        if (currentUserRole === 'admin') {
            endpoint = "/api/v1/reservations/all";
        } else if (currentUserRole === 'user') {
            endpoint = "/api/v1/reservations/my-reservations";
        } else {
            console.error("Rôle utilisateur inconnu :", currentUserRole);
            showAlert("Impossible de récupérer les réservations : rôle non reconnu.", "error");
            displayReservations([]);
            return;
        }

        try {
            const response = await fetch(endpoint, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Statut ${response.status}: ${response.statusText}` }));
                console.error(`Erreur ${response.status} lors de la récupération des réservations:`, errorData.message);
                showAlert(`Erreur lors de la récupération des réservations: ${errorData.message}`, "error");
                displayReservations([]);
                return;
            }

            const reservations = await response.json();
            console.log("✅ Réservations récupérées :", reservations);
            displayReservations(reservations);
        } catch (error) {
            console.error("❌ Erreur réseau ou inattendue lors de la récupération des réservations :", error);
            showAlert("Une erreur inattendue est survenue lors de la récupération des réservations.", "error");
            displayReservations([]);
        }
    }

    // Fonctions Admin-exclusive
    async function handleDeleteReservation(reservationId) {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) {
            return;
        }

        try {
            const response = await fetch(`/api/v1/reservations/${reservationId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })

            if (response.ok) {
                showAlert("Réservation supprimée avec succès.", "success");
                fetchReservations();
            } else {
                const errorData = await response.json();
                showAlert(`Erreur lors de la suppression: ${errorData.message}`, "error");
            }
        } catch (error) {
            console.error("Erreur réseau lors de la suppression de la réservation:", error);
            showAlert("Erreur réseau lors de la suppression de la réservation.", "error")
        }
    }

    async function handleModifyReservation(reservationId, currentReservationData) {
        const newStatus = prompt(`Modifier le statut de la réservation ${reservationId} (actuel: ${currentReservationData.status}). Entrez "pending" ou "confirmed" :`);

        if (newStatus === null || (newStatus !== "pending" && newStatus !== "confirmed")) {
            showAlert("Modification annulée ou statut invalide.", "info");
            return;
        }

        try {
            const response = await fetch(`/api/v1/reservations/${reservationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                showAlert("Réservation modifiée avec succès.", "success");
                fetchReservations();
            } else {
                const errorData = await response.json();
                showAlert(`Erreur lors de la modification: ${errorData.message}`, "error");
            }
        } catch (error) {
            console.error("Erreur réseau lors de la modification de la réservation:", error);
            showAlert("Erreur réseau lors de la modification de la réservation.", "error");
        }
    }

    // --- Initialisation et Écouteurs d'événements ---

    // Initialisation du slider de prix et écouteur d'événement
    if (filterPriceMaxInput && priceValueSpan) {
        priceValueSpan.textContent = `${filterPriceMaxInput.value}€`; // CORRIGÉ
        filterPriceMaxInput.addEventListener("input", () => {
            priceValueSpan.textContent = `${filterPriceMaxInput.value}€`;
            fetchRooms(); // Déclenche une nouvelle recherche à chaque mouvement du slider
        });
    } else {
        console.error("Erreur : L'élément filterPriceMax ou priceValue n'a pas été trouvé !");
    }

    // Écouteurs pour les filtres des chambres 
    if (filterTypeSelect) {
        filterTypeSelect.addEventListener("change", fetchRooms);
    }
    if (filterAccessibilitySelect) {
        filterAccessibilitySelect.addEventListener("change", fetchRooms);
    }
    if (filterSortPriceSelect) { // CORRIGÉ
        filterSortPriceSelect.addEventListener("change", fetchRooms);
    }
    if (filterCheckInDateInput) {
        filterCheckInDateInput.addEventListener("change", fetchRooms);
    }
    if (filterCheckOutDateInput) {
        filterCheckOutDateInput.addEventListener("change", fetchRooms);
    }

    // Écouteur pour le bouton de soumission du formulaire de filtre de chambres 
    if (roomFilterForm) {
        roomFilterForm.addEventListener("submit", fetchRooms);
    }

    // Écouteur pour le formulaire de réservation (POST)
    if (reservationForm) {
        reservationForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const customerName = document.getElementById("customerName").value;
            const roomNumber = document.getElementById("roomNumber").value;
            const checkInDate = document.getElementById("checkInDate").value;
            const checkOutDate = document.getElementById("checkOutDate").value;
            const specialRequests = document.getElementById('specialRequests').value;

            if (!customerName || !roomNumber || !checkInDate || !checkOutDate) {
                showAlert("Veuillez remplir tous les champs de la réservation.", "error");
                return;
            }

            const data = { customerName, roomNumber, checkInDate, checkOutDate, status: "pending", specialRequests };

            try {
                const response = await fetch("/api/v1/reservations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `Statut ${response.status}: ${response.statusText}` }));
                    showAlert(`Erreur lors de la réservation : ${errorData.message}`, "error");
                    return;
                }

                showAlert("Réservation réussie !", "success");
                resetReservationForm();
                fetchReservations();
            } catch (error) {
                console.error("Erreur lors de la soumission de la réservation :", error);
                showAlert("Erreur réseau ou inattendue lors de la réservation.", "error");
            }
        });
    }

    // Écouteur pour l'inscription (Register)
    if (registerBtn) {
        registerBtn.addEventListener("click", async () => {
            const username = prompt("Entrez votre nom d'utilisateur :");
            const email = prompt("Entrez votre email :");
            const password = prompt("Mot de passe :");

            if (!username || !email || !password) {
                showAlert("Tous les champs sont requis pour l'inscription.", "error");
                return;
            }

            try {
                const response = await fetch("/api/v1/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ username, email, password })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `Statut ${response.status}: ${response.statusText}` }));
                    showAlert(`Échec de l'inscription : ${errorData.message}`, "error");
                    return;
                }

                showAlert("Inscription réussie ! Vous pouvez maintenant vous connecter.", "success");

            } catch (error) {
                console.error("Erreur lors de l'inscription :", error);
                showAlert("Erreur réseau ou inattendue lors de l'inscription.", "error");
            }
        });
    }

    // Écouteur pour la connexion (Login)
    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            const identifier = prompt("Entrez votre nom d'utilisateur ou votre mail :");
            const password = prompt("Mot de passe :");

            if (!identifier || !password) {
                showAlert("Tous les champs sont requis pour la connexion.", "error");
                return;
            }

            try {
                const response = await fetch("/api/v1/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ identifier, password })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `Statut ${response.status}: ${response.statusText}` }));
                    console.error("❌ Erreur HTTP :", response.status, errorData.message);
                    showAlert("Échec de la connexion : " + errorData.message, "error");
                    return;
                }

                const data = await response.json();
                console.log("✅ Réponse JSON :", data);

                currentUserRole = data.role;
                currentUsername = data.username;
                updateConnectionStatus(currentUsername);
                showAlert("Connexion réussie !", "success");

                fetchReservations();
            } catch (error) {
                console.error("Erreur réseau ou inattendue lors de la connexion :", error);
                showAlert("Une erreur inattendue est survenue lors de la connexion.", "error");
            }
        });
    }

    // Écouteur pour la déconnexion (Logout)
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                console.log("Tentative de déconnexion...");

                const response = await fetch("/api/v1/auth/logout", {
                    method: "POST",
                    credentials: "include"
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: response.statusText }));
                    console.error("❌ Échec de la déconnexion :", response.status, errorData.message);
                    showAlert(`Échec de la déconnexion : ${errorData.message}`, "error");
                    return;
                }

                showAlert("Déconnexion réussie !", "success");
                resetReservationForm();

                currentUserRole = null;
                currentUsername = null;
                updateConnectionStatus(null);

                fetchReservations();

                setTimeout(() => {
                    window.location.reload();
                }, 500);

            } catch (error) {
                console.error("Erreur réseau ou inattendue lors de la déconnexion :", error);
                showAlert("Une erreur inattendue est survenue lors de la déconnexion.", "error");
            }
        });
    }

    // --- Appels initiaux au chargement de la page ---
    fetchRooms();
    fetchReservations();
    resetDateFilters();
});