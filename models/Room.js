const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: { type: Number, unique: true, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    amenities: { type: [String], default: [] },
    available: { type: Boolean, default: true },
    accessibility: { type: Boolean, default: false }
});

module.exports = mongoose.model('Room', roomSchema);
