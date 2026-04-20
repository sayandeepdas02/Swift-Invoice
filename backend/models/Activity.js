import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    type: { 
        type: String, 
        enum: ['CREATED', 'SENT', 'VIEWED', 'PAID', 'REMINDER_SENT'], 
        required: true 
    },
    metadata: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, immutable: true }
});

activitySchema.index({ invoiceId: 1, type: 1 });
activitySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Activity', activitySchema);
