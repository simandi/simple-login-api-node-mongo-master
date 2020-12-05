const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    username: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    logIn: { type: Date, default: Date.now },
    role: {type: String, required: true},
    IP:{type:String, required: true},
    logOut: { type: Date, default: null }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('AuditorData', schema);