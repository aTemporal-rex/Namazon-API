const mongoose = require('mongoose');
const cartData = mongoose.model('Cart', new mongoose.Schema(
    {
        cartItems: [
            {
                quantity: Number,
                storeItem: {type: mongoose.ObjectId, ref: 'StoreItem'}
            }
        ]
    })
)

module.exports = cartData;
