var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Admin', 'User'],
        deafult: 'User'
    }
});

// generating a hash
userSchema.methods.generateHash = function(password) {
return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);