import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    companyName: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

clientSchema.index({ userId: 1, email: 1 });

const Client = mongoose.model('Client', clientSchema);

export default Client;
