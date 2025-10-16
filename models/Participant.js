const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  name: String,
  email: String,
  sentInvite: { type: Boolean, default: false }
});

module.exports = mongoose.model("Participant", participantSchema);
