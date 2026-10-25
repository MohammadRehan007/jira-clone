const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., "Updated status from To Do to In Progress"
  details: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
