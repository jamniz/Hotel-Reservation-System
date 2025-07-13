const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");
const { updateRoom, deleteRoom } = require("../controllers/adminController")

//  Routes de gestion des chambres (exclusivement admin)
router.put("/rooms/:id", verifyToken, verifyAdmin, updateRoom);
router.delete("/rooms/:id", verifyToken, verifyAdmin, deleteRoom);

module.exports = router 