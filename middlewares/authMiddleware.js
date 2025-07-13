const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) return res.status(401).json({ error: "Accès refusé, authentification requise." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log("Utilisateur authentifié :", req.user);
        console.log("Cookies reçus :", req.cookies);
        next();
    } catch (error) {
        return res.status(403).json({ error: "Token invalide ou expiré." });
    }
};

const verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé. Admin uniquement." });
    }
    next();
};

module.exports = { authenticateUser, verifyAdmin };
