const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    branch: {
        type: Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    image: {
        type: String
    },
    available: {
        type: Boolean,
        default: true
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

productSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
