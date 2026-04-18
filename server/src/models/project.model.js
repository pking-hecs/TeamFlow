import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  deadline: {
    type: Date
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

export default Project;