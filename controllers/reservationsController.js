const Reservation = require("../models/Reservation");
const Room = require("../models/Room");
const User = require("../models/User");

//  Récupérer toutes les réservations (admin)
const getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({})
            .populate('roomId', 'roomNumber type price')
            .populate('user', 'username email')
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 })
            .exec();
        res.json(reservations);
    } catch (err) {
        console.error("Erreur lors de la récupération de toutes les réservations :", err);
        res.status(500).json({ error: err.message });
    }
};

//  Récupérer les réservations d'utilisateur (utilisateur lui-même)
const getUserReservations = async (req, res) => {
    try {
        const userId = req.user.id
        console.log("Tentative de récupération des réservations pour l'utilisateur ID:", userId)

        // Trouver les réservations où le champ 'user' correspond à l'ID de l'utilisateur connecté
        const userReservations = await Reservation.find({ user: userId })
            .populate('roomId', 'roomNumber type price')
            .exec();
        res.json(userReservations)
        console.log("Réservations trouvées (populées) :", userReservations);
    } catch (err) {
        console.error("Erreur lors de la récupération des réservations de l'utilisateur :", err);
        res.status(500).json({ error: err.message });
    }
}

const createReservation = async (req, res) => {
    console.log("req.body reçu:", req.body);
    try {
        const { roomNumber, customerName, checkInDate, checkOutDate, specialRequests } = req.body;
        const requestingUserId = req.user.id;
        const requestingUserRole = req.user.role;

        // 1. Vérification des champs obligatoires
        if (!roomNumber || !customerName || !checkInDate || !checkOutDate) {
            return res.status(400).json({ error: "Tous les champs sont obligatoires." });
        }

        // 2. Trouver la chambre par son numéro
        const room = await Room.findOne({ roomNumber: roomNumber });
        if (!room) {
            return res.status(404).json({ error: "Chambre introuvable." });
        }

        const roomId = room._id;

        // 3. Déterminer l'utilisateur réel de la réservation (le client)
        let reservationUserId;

        if (requestingUserRole === "admin") {
            const targetUser = await User.findOne({ username: customerName });
            if (!targetUser) {
                // Si l'admin tente de créer une résa pour un utilisateur inconnu
                return res.status(400).json({ error: "L'utilisateur ciblé pour la réservation est introuvable." });
            }
            reservationUserId = targetUser._id; // L'admin réserve pour 'targetUser'
        } else {
            const currentUser = await User.findById(requestingUserId);
            if (!currentUser || currentUser.username !== customerName) {
                return res.status(403).json({ error: "Les utilisateurs ne peuvent réserver que pour eux-mêmes." });
            }
            reservationUserId = requestingUserId;
        }

        // 4. Vérifier les conflits de réservation
        const conflict = await Reservation.findOne({
            roomId,
            $or: [
                { checkInDate: { $lt: new Date(checkOutDate) }, checkOutDate: { $gt: new Date(checkInDate) } }
            ]
        });

        if (conflict) {
            return res.status(400).json({ error: "La chambre est déjà réservée pendant cette période." });
        }

        // 5. Création de la réservation avec l'ID de l'utilisateur
        const reservation = new Reservation({
            roomId,
            user: reservationUserId,
            customerName,
            checkInDate,
            checkOutDate,
            createdBy: requestingUserId,
            specialRequests
        });

        await reservation.save();
        res.status(201).json({ message: "Réservation créée avec succès !", reservation });
    } catch (err) {
        console.error("Erreur lors de la création de la réservation :", err);
        res.status(500).json({ error: err.message });
    }
};


//  Modifier une réservation (Exclusivement pour l’admin)
const modifyReservation = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Accès refusé. Seuls les admins peuvent modifier les réservations." });
    }

    try {
        const { id } = req.params;
        const updatedReservation = await Reservation.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedReservation) {
            return res.status(404).json({ error: "Réservation introuvable." });
        }

        res.json({ message: "Réservation modifiée avec succès.", updatedReservation });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//  Supprimer une réservation
const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;
        await Reservation.findByIdAndDelete(id);
        res.json({ message: "Réservation supprimée avec succès !" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getReservations, getUserReservations, createReservation, modifyReservation, deleteReservation };
