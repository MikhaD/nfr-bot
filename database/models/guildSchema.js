const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const guildSchema = new Schema({
	_id: { type: String, required: true },
	prefix: { type: String, required: true },
	xp: {type: Number, required: true },
	level: { type: Number, required: true },
	created: { type: String, required: true },
	territories: Map,
	banner: Object
}, { timestamps: true });

module.exports = mongoose.model("guild", guildSchema);