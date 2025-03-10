const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    items: [{
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
        }
    }],
    total_amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
        default: 'pending'
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    payment_method: {
        type: String,
        enum: ['cash', 'card', 'online'],
        required: true
    },
    delivery_address: {
        street: String,
        city: String,
        state: String,
        zip: String
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

orderSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
