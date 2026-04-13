import mongoose from 'mongoose';

const serviceItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

// Avoid duplicate service names per user to keep auto-complete clean
serviceItemSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('ServiceItem', serviceItemSchema);
