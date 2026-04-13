import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function() { return !this.isGoogleAuth; } },
    mobile: { type: String, default: 'Not Provided' },
    isGoogleAuth: { type: Boolean, default: false },
    googleId: { type: String, sparse: true, unique: true },
    businessName: { type: String, default: '' },
    businessEmail: { type: String, default: '' },
    businessAddress: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    defaultCurrency: { type: String, default: 'USD' },
    invoicePrefix: { type: String, default: 'INV' },
    invoiceCounter: { type: Number, default: 1 }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function (password) {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
