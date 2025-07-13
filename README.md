# Hotel-Reservation-System
**À VENIR** → _Hotel Reservation System – Une immersion fictive dans la gestion hôtelière_  

🔹 **Un projet imaginé pour apprendre, tester et expérimenter**  
🔹 **Un hôtel qui n’existe pas, mais un système qui pourrait être utilisé dans le monde réel**  

🚀 **L’objectif ?**  
Créer une base **solide et intuitive** permettant aux utilisateurs de **visualiser, filtrer et réserver des chambres**, tout en laissant place à **l’expérimentation et l’amélioration du design selon un esprit DIY.**  

![Project under Construction](/UC-1.png)

---

### 🏨 **L’Hôtel Fictif : Hôtel n°1**  
🛌 **Un établissement fictif pensé pour tester et développer**  
✅ Différents types de chambres (**Suite, Standard, Deluxe**)   
✅ Le backend permet de **filtrer les chambres** selon plusieurs critères (via les données : **type, prix, disponibilité**)  
✅ **Tri des résultats** côté backend pour optimiser la recherche  
✅ **Système de réservation intégré** incluant la vérification de disponibilité  
 

---

### 🚀 **Tech Stack**  
✅ **Backend** : Node.js + Express  
✅ **Base de données** : MongoDB  
✅ **Frontend minimaliste** : HTML + JavaScript (avec une approche sur-mesure et SASS)  
✅ **API REST** : Gestion complète des chambres  

---

### 🔥 **Amélioration du design : Une approche sur-mesure et évolutive**  
💡 **Plutôt que de s’appuyer sur un framework pré-construit**, ce projet met l’accent sur **une personnalisation totale** grâce à une structuration claire du CSS **via une approche vanilla**.  

✅ **Flexibilité maximale** pour adapter l’interface aux besoins spécifiques  
✅ **Gestion optimisée des styles**, permettant une adaptation facile  
✅ **Approche modulaire et évolutive**, offrant une parfaite maîtrise du design  

📌 **L’objectif ?** Permettre une liberté créative totale et un affichage intuitif et performant.  

---

### 🔥 **Prochaines améliorations**  
✅ **Affiner et améliorer le système de réservation existant** (ex: modification/annulation plus flexibles)  
✅ **Peaufiner l’affichage des chambres** avec une mise en page plus intuitive et des détails visuels.  
✅ **Optimiser l’expérience utilisateur** via une interface fluide et interactive.  
✅ **Explorer les filtres et options de recherche** côté frontend pour les chambres.  
✅ **Expérimenter des animations et interactions avancées** pour enrichir l'interface.    

---

> [!NOTE]
> _Ce projet est en développement actif. Les mises à jour sont poussées régulièrement depuis un dépôt de travail privé._

---
<details>

<summary>Démarrage rapide (Local)</summary>


### ⚙️ **Démarrage rapide (Local)**  

Pour lancer ce projet en local, suivez ces étapes :

1.  **Clonez le dépôt :**
    ```bash
    git clone https://github.com/jamniz/Hotel-Reservation-System.git
    cd Hotel-Reservation-System
    ```
2.  **Installez les dépendances :**
    ```bash
    npm install
    ```
3.  **Configurez les variables d'environnement :**
    Créez un fichier `.env` à la racine du projet, basé sur le modèle `.env.example`. Renseignez vos propres valeurs pour la connexion à la base de données et les secrets JWT.
    ```
    # Exemple de contenu pour .env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    PORT=3000
    ```
4.  **Démarrez le serveur :**
    ```bash
    npm start
    # ou npm run dev (si vous avez un script de développement)
    ```
5.  **Accédez à l'application :**
    Ouvrez votre navigateur et naviguez vers `http://localhost:3000` (ou le port que vous avez configuré).

---
</details>
