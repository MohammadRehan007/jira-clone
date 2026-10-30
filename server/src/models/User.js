const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'ProjectLead', 'Developer', 'Tester', 'Viewer'], 
    default: 'Developer' 
  },
  avatar: { type: String, default: '' },
  avatarPublicId: { type: String, default: '' },
  department: { type: String, default: 'Engineering' },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
