const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  key: { type: String, required: true, uppercase: true, trim: true, index: true },
  description: { type: String, default: '' },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ticketCounter: { type: Number, default: 100 }
}, { timestamps: true });

projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
