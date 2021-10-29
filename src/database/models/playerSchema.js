const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playerSchema = new Schema({
	_id: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("player", playerSchema);