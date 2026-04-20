import express from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, JPG, and PNG files are allowed'), false);
    }
};
const upload = multer({ 
    storage, 
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB restriction
    fileFilter 
});

router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Extremely safe fallback for dev lacking ENV keys: return base64
        if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
            console.log('[WARN] CLOUDINARY_CLOUD_NAME is missing or invalid. Falling back to explicit Base64 proxy.');
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            return res.json({ success: true, url: base64Image, message: 'Uploaded explicitly to base64 fallback' });
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const uploadResult = await cloudinary.uploader.upload(dataURI, {
            folder: 'swift-invoice',
            resource_type: 'auto'
        });

        res.json({ success: true, url: uploadResult.secure_url, message: 'Upload successful' });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Image upload failed' });
    }
});

export default router;
