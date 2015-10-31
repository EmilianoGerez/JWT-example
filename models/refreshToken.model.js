var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var refreshSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    agent: {
        device: String,
        os: String,
        browser: String
    },
    user: {
        type: Schema.ObjectId,
        required: true
    }
});

module.exports = mongoose.model('RefreshToken', refreshSchema);
