const mongoose = require('mongoose');
const { type } = require('node:os');

const PostSchema = new mongoose.Schema({
    username: {type: String, required: true},
    content: {type: String, required: true},
    image: {type: String},
    likes: {type: Number, default: 0},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Post', PostSchema);