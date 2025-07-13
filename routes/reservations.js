const express = require("express");
const router = express.Router();
const { getReservations, getUserReservations, createReservation, deleteReservation } = require("../controllers/reservationsController");
const { authenticateUser, verifyAdmin } = require("../middlewares/authMiddleware");

router.get("/all", authenticateUser, verifyAdmin, getReservations);
router.get("/my-reservations", authenticateUser, getUserReservations);
router.post("/", authenticateUser, createReservation);
router.delete("/:id", authenticateUser, verifyAdmin, deleteReservation);

module.exports = router;