require("dotenv").config();
const Room = require("../models/Room")
const Reservation = require("../models/Reservation")

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';


const getAvailableRooms = async (req, res) => {
    // 1. Déstructuration initiale des paramètres de requête
    const { checkInDate, checkOutDate, type, accessibility, priceMax, sort } = req.query;

    // 2. Conversion des dates en objets Date dès le début
    const queryDateIn = new Date(checkInDate);
    const queryDateOut = new Date(checkOutDate);

    console.log("🔍 Requête reçue →", req.method, req.url);
    console.log("Paramètres de recherche reçus :", { checkInDate, checkOutDate, type, accessibility, priceMax, sort });
    console.log("Dates converties : queryDateIn =", queryDateIn, " | queryDateOut =", queryDateOut);

    // 3. Validation initiale des paramètres bruts (chaînes)
    if (!checkInDate || !checkOutDate) {
        return res.status(400).json({ error: "Les dates d'arrivée et de départ sont requises pour la recherche de disponibilité." });
    }

    console.log("🔍 Requête reçue →", req.method, req.url);

    try {
        // --- Validation des dates (objets Date) ---
        if (isNaN(queryDateIn.getTime()) || isNaN(queryDateOut.getTime())) {
            console.error("Erreur: Dates d'arrivée ou de départ invalides après conversion.");
            return res.status(400).json({ message: "Dates d'arrivée ou de départ invalides." });
        }
        if (queryDateOut <= queryDateIn) {
            console.error("Erreur: La date de départ doit être postérieure à la date d'arrivée.");
            return res.status(400).json({ message: "La date de départ doit être postérieure à la date d'arrivée." });
        }

        // --- Logique pour trouver les chambres réservées qui chevauchent la période ---
        console.log("Recherche des réservations chevauchantes entre", queryDateIn, "et", queryDateOut);
        const overlappingReservations = await Reservation.find({
            $or: [
                {
                    checkInDate: { $lt: queryDateOut },
                    checkOutDate: { $gt: queryDateIn }
                }
            ]
        });

        console.log("Réservations chevauchantes trouvées :", overlappingReservations.length, "réservations.");
        console.log("Détail des réservations chevauchantes:", overlappingReservations);

        const reservedRoomIds = overlappingReservations.map(res => res.roomId);

        console.log("IDs des chambres réservées pendant cette période :", reservedRoomIds);

        // --- Construction du filtre pour les chambres disponibles ---
        let roomFilter = {
            _id: { $nin: reservedRoomIds },
            available: true
        };

        // Ajout des autres filtres 
        if (type) {
            roomFilter.type = type;
            if (DEBUG_MODE) {
                console.log("Filtre ajouté: type =", type);
            }
        }
        if (accessibility) {
            roomFilter.accessibility = accessibility === 'true';
            if (DEBUG_MODE) {
                console.log("Filtre ajouté: accessibility =", accessibility);
            }
        }
        if (priceMax) {
            roomFilter.price = { $lte: parseFloat(priceMax) };
            if (DEBUG_MODE) {
                console.log("Filtre ajouté: priceMax =", parseFloat(priceMax));
            }
        }

        console.log("Filtre final pour les chambres disponibles :", roomFilter);

        // --- Options de tri ---
        let sortOptions = {};
        if (sort) { // Utilisez directement la variable 'sort' déstructurée
            if (sort === 'priceAsc') {
                sortOptions.minPrice = 1;
            } else if (sort === 'priceDesc') {
                sortOptions.minPrice = -1;
            }
        }

        console.log("Options de tri :", sortOptions);

        // --- Recherche des chambres disponibles avec les filtres et le tri ---
        const availableRooms = await Room.find(roomFilter).sort(sortOptions);

        console.log("Nombre de chambres trouvées correspondant aux critères :", availableRooms.length);
        console.log("Chambres disponibles trouvées :", availableRooms);

        res.status(200).json(availableRooms);

    } catch (error) {
        console.error("Erreur lors de la récupération des chambres disponibles:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des chambres disponibles." });
    }
}
const getRooms = async (req, res) => {
    try {
        let query = {};

        if (req.query.type) query.type = req.query.type;
        if (req.query.accessibility) query.accessibility = req.query.accessibility === "true";
        if (req.query.available) query.available = req.query.available === "true";
        if (req.query.priceMax) query.price = { $lte: Number(req.query.priceMax) };

        const sortOption = req.query.sort ? { price: req.query.sort === "price" ? 1 : -1 } : {};

        const rooms = await Room.find(query).sort(sortOption);
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


module.exports = { getAvailableRooms, getRooms }