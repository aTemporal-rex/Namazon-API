const mongoose = require('mongoose');
const storeData = mongoose.model('StoreItem', new mongoose.Schema(
    {
        quantity: Number,
        description: String,
        name: String
    })
)

module.exports = storeData;