const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  goal: { type: String, default: '' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Planned', 'Active', 'Completed'], 
    default: 'Planned',
    index: true
  }
}, { timestamps: true });

sprintSchema.index({ project: 1, status: 1 });
sprintSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Sprint', sprintSchema);
