const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const orderSchema = new Schema({
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    user: {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }
});

module.exports = mongoose.model('Order', orderSchema);