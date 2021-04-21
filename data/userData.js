const mongoose = require('mongoose');
const userData = mongoose.model('User', new mongoose.Schema(
    {

        firstName: String,
        lastName: String,
        email: String,
        login: String,
        password: String,
        cart: {type: mongoose.ObjectId, ref: 'Cart'}

    })
)

module.exports = userData;