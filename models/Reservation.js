const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: "pending"
    },
    specialRequests: {
        type: String
    }
}, { timestamps: true });

reservationSchema.index({ roomId: 1, checkInDate: 1, checkOutDate: 1, user: 1 }, { unique: true }); // Empêche les doublons


const Reservation = mongoose.model("Reservation", reservationSchema);
module.exports = Reservation;
