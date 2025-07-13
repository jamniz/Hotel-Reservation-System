const express = require("express");
const { getRooms, getAvailableRooms } = require("../controllers/roomsController")

const router = express.Router();

router.get('/available', getAvailableRooms);
router.get("/", getRooms);

module.exports = router;