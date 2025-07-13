const Room = require("../models/Room")

//  Mettre à jour une chambre (réservé aux admins)
const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedRoom = await Room.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedRoom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//  Supprimer une chambre (réservé aux admins)
const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        await Room.findByIdAndDelete(id);
        res.json({ message: "Chambre supprimée avec succès !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { updateRoom, deleteRoom }