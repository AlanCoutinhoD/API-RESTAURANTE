const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderItemSchema = new Schema({
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    notes: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

orderItemSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
module.exports = OrderItem;
