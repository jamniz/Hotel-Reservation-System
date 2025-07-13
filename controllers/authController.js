require("dotenv").config(); // Chargement des variables d'environnement
const User = require("../models/User"); // Modèle utilisateur
const jwt = require("jsonwebtoken"); // Gestion des tokens
const bcrypt = require("bcryptjs"); // Hachage des mots de passe
const SuspiciousLog = require("../models/SuspiciousLog");

const DEBUG_MODE = process.env.DEBUG_MODE === "true";


// INSCRIPTION - USER
const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        console.log("Requête reçue - req.body :", req.body);

        // 🛑 Sécurité : Interdire la tentative d’enregistrement avec un rôle personnalisé

        if (role && role !== "user") {
            console.warn("❗ Tentative d'enregistrement avec un rôle non autorisé :", role);

            await SuspiciousLog.create({
                ip: req.ip,
                email,
                username,
                triedRole: role
            });

            return res.status(403).json({ error: "Création d'utilisateur avec rôle interdit." });
        }

        // Vérifier les champs obligatoires
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Tous les champs sont requis." });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Utilisateur existant trouvé :", existingUser);
            return res.status(400).json({ error: "Email déjà utilisé." });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const newUser = await User.create({ username, email, password: hashedPassword, role: "user" });
        console.log("Nouvel utilisateur créé :", newUser);

        res.status(201).json({ message: "Utilisateur créé avec succès !" });
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        res.status(500).json({ error: "Erreur lors de l'inscription." });
    }
};

// CONNEXION - USER
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
};
const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
}

const loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        console.log("Tentative de connexion - Identifiant :", identifier);

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }]
        });

        if (DEBUG_MODE) {
            console.log("Utilisateur trouvé :", user);
            console.log("Mot de passe reçu :", password);
            console.log("Mot de passe enregistré :", user?.password);
        }

        if (!user) {
            console.log("Utilisateur non trouvé !");
            return res.status(400).json({ error: "Utilisateur non trouvé." });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Résultat de bcrypt.compare() :", isMatch);

        if (!isMatch) {
            console.log("Échec de la connexion : Mot de passe incorrect !");
            return res.status(401).json({ error: "Mot de passe incorrect." });
        }

        // Générer un token JWT
        const token = generateToken(user);
        console.log("Token généré :", token);
        const refreshTokenValue = generateRefreshToken(user);
        console.log("RefreshToken généré :", refreshTokenValue)

        res.cookie("accessToken", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Lax" });
        res.cookie("refreshToken", refreshTokenValue, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Lax" })

        res.status(200).json({
            message: "Connexion réussie !",
            username: user.username,
            role: user.role
        });
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({ error: "Erreur lors de la connexion." });
    }
};

// REFRESH TOKEN
const refreshToken = (req, res) => {
    console.log("Cookies reçus :", req.cookies);

    const token = req.cookies.refreshToken;

    if (!token) {
        console.log("Aucun Refresh Token trouvé !");
        return res.status(401).json({ error: "Refresh Token manquant." });
    }

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
        console.log("Token décodé :", decoded);

        const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        console.log("Nouveau Token généré :", newAccessToken);
        res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Lax" });
        res.status(200).json({ message: "Access Token renouvelé avec succès !" });

    } catch (error) {
        console.error("Erreur de validation du Refresh Token :", error);
        // Efface le refreshToken si la validation échoue
        res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Lax" })
        res.status(403).json({ error: "Refresh Token invalide ou expiré." });
    }
};

// DÉCONNEXION - USER
const logoutUser = (req, res) => {
    console.log("Déconnexion demandée !");
    res.clearCookie("accessToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Lax" });
    res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Lax" });
    res.status(200).json({ message: "Déconnexion réussie !" });
};

module.exports = { registerUser, loginUser, logoutUser, refreshToken };
