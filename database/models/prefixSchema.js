const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const prefixSchema = new Schema({
	_id: { type: String, required: true },
	names: { type: Array, required: true }
	// name: { type: Array, required: true }
});

module.exports = mongoose.model("prefix", prefixSchema);