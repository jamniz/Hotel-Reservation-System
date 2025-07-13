const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" }
});

// 🔹 Hachage du mot de passe avant sauvegarde
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// 🔹 Vérification du mot de passe
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
