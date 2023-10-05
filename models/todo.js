const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    taskName: {
        type: String,
        required: [true, 'Please Enter Task Name'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})


module.exports = mongoose.model('Todo', todoSchema)
