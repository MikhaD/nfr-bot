const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const territoryListSchema = new Schema({

}, { timestamps: true });

module.exports = mongoose.model("territoryList", territoryListSchema);