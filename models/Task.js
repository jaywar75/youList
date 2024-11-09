// models/Task.js

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    notes: String,
    dueDate: Date,
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    tags: [String],
    subtasks: [String],
    recurrence: { type: String, enum: ['None', 'Daily', 'Weekly', 'Monthly'], default: 'None' },
    status: { type: String, enum: ['Active', 'Completed', 'Removed'], default: 'Active' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
