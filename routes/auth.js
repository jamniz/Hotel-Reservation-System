const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const User = require("../models/User");
const { authenticateUser } = require("../middlewares/authMiddleware");

router.post("/login", authController.loginUser);
router.post("/register", authController.registerUser);
router.post("/logout", authController.logoutUser);

router.get("/me", authenticateUser, (req, res) => {
    res.json({ user: req.user }); // Retourne les infos de l'utilisateur connecté
});

router.get("/users", authenticateUser, async (req, res) => {
    try {
        const users = await User.find(); // 🔹 Récupère tous les utilisateurs
        res.json(users);
    } catch (error) {
        console.log("Erreur MongoDB :", error); // 🔥 Affiche l'erreur détaillée
        res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
    }
});

module.exports = router;
