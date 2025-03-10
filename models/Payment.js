const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        enum: ['cash', 'card', 'online'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    transaction_id: String,
    payment_details: {
        card_number: String,
        card_expiry: String,
        card_name: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

paymentSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
