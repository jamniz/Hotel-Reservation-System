require("dotenv").config(); //  Chargement des variables d'environnement
const express = require("express");
const mongoose = require("mongoose");
const { DEBUG_MODE, PORT, CORS_ALLOWED_ORIGINS } = require('./config/appConfig');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = {
    origin: CORS_ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 204
};
const app = express();
const path = require("path")
const authRoutes = require("./routes/auth");
const roomsRoutes = require("./routes/rooms");
const reservationsRoutes = require("./routes/reservations");

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (DEBUG_MODE) {
    console.log("DEBUG MODE ACTIVÉ !");
}

// MIDDLEWARES
app.use(express.json());  //  Gestion JSON
app.use(cookieParser());  //  Gestion des cookies
app.use(cors(corsOptions));  //  Ajout de CORS sécurisé
app.use(express.static(path.join(__dirname, 'public')));
app.get("/", (req, res) => { res.sendFile(path.resolve(__dirname, "public", "index.html")); });

app.use((req, res, next) => {
    console.log(`🔍 Requête reçue → ${req.method} ${req.url}`);
    next();
});

// ROUTES
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/rooms", roomsRoutes);
app.use("/api/v1/reservations", reservationsRoutes);



// 🔹 Connexion à MongoDB et démarrage du serveur
mongoose.connection.once("open", () => {
    console.log(`✅ Connecté à la base MongoDB : ${mongoose.connection.db.databaseName}`);
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Connexion à MongoDB établie");
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le http://localhost:${PORT}`);
        });
    })
    .catch((error) => console.error("❌ Erreur de connexion MongoDB :", error));

process.on("SIGINT", async () => {
    console.log("\n🔥 Fermeture du serveur proprement...");
    await mongoose.connection.close();
    console.log("🔌 Connexion MongoDB fermée.");
    process.exit(0);
});