const mongoose = require("mongoose");

const suspiciousLogSchema = new mongoose.Schema({
    ip: String,
    email: String,
    username: String,
    triedRole: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SuspiciousLog", suspiciousLogSchema);
