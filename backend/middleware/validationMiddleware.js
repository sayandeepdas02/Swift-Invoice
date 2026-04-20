import { body, validationResult } from 'express-validator';

export const validateInvoice = [
    // Client details validation (skip if draft)
    body('client.name')
        .if((value, { req }) => !req.body.isDraft)
        .notEmpty().withMessage('Client name is required')
        .trim().escape(),
    body('client.email')
        .if((value, { req }) => !req.body.isDraft)
        .notEmpty().withMessage('Client email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),

    // Sender details validation
    body('sender.name').if((value, { req }) => !req.body.isDraft).notEmpty().withMessage('Sender name is required').trim().escape(),
    body('sender.email').if((value, { req }) => !req.body.isDraft).notEmpty().withMessage('Sender email is required').isEmail().normalizeEmail(),

    // Items array validation
    body('items')
        .if((value, { req }) => !req.body.isDraft)
        .isArray({ min: 1 }).withMessage('Invoice must have at least one item'),
    body('items.*.description')
        .if((value, { req }) => !req.body.isDraft)
        .notEmpty().withMessage('Item description is required')
        .trim().escape(),
    body('items.*.quantity')
        .if((value, { req }) => !req.body.isDraft)
        .isFloat({ gt: 0 }).withMessage('Item quantity must be greater than 0'),
    body('items.*.rate')
        .if((value, { req }) => !req.body.isDraft)
        .isFloat({ min: 0 }).withMessage('Item rate cannot be negative'),

    // We do NOT trust totalAmount, taxAmount, subtotal sent from frontend.
    // They will be recalculated in the service.
];

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};
