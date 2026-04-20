import User from '../models/User.js';

export const getSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.workspaceId).select('businessName businessEmail businessAddress logoUrl defaultCurrency invoicePrefix invoiceCounter taxType defaultTaxRate defaultTerms dateFormat');
        if (!user) {
            return res.status(404).json({ success: false, data: null, message: 'User not found' });
        }
        res.json({ success: true, data: user, message: 'Settings fetched successfully' });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const updatableFields = ['businessName', 'businessEmail', 'businessAddress', 'logoUrl', 'defaultCurrency', 'invoicePrefix', 'taxType', 'defaultTaxRate', 'defaultTerms', 'dateFormat'];
        const updates = {};
        
        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user.workspaceId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ success: true, data: user, message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
};
