const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketKey: { type: String, required: true }, // e.g. "PROJ-101"
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type: { 
    type: String, 
    enum: ['Bug', 'Task', 'Story', 'Epic'], 
    default: 'Task' 
  },
  status: { 
    type: String, 
    enum: ['To Do', 'In Progress', 'In Review', 'Testing', 'Done'], 
    default: 'To Do' 
  },
  priority: { 
    type: String, 
    enum: ['Lowest', 'Low', 'Medium', 'High', 'Highest'], 
    default: 'Medium' 
  },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  sprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint', default: null, index: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storyPoints: { type: Number, default: 1 },
  dueDate: { type: Date, default: null },
  tags: [{ type: String }],
  attachments: [{
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    name: { type: String, default: '' },
    size: { type: Number, default: 0 },
    format: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

ticketSchema.index({ project: 1, sprint: 1 });
ticketSchema.index({ project: 1, status: 1 });
ticketSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);
