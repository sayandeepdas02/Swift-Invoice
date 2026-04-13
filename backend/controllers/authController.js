import * as authService from '../services/authService.js';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-domain prod, 'lax' for local dev
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

export const register = async (req, res) => {
    try {
        const { user, token } = await authService.registerUser(req.body);
        
        res.cookie('jwt', token, COOKIE_OPTIONS);

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile
            },
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(error.cause || 500).json({ success: false, data: null, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.loginUser(email, password);

        res.cookie('jwt', token, COOKIE_OPTIONS);

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                businessDetails: user.businessDetails
            },
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(error.cause || 500).json({ success: false, data: null, message: error.message });
    }
};

export const logout = (req, res) => {
    res.cookie('jwt', '', {
        ...COOKIE_OPTIONS,
        maxAge: 0,
        expires: new Date(0)
    });
    res.status(200).json({ success: true, data: null, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
    try {
        const user = await authService.getUserById(req.user._id);
        res.json({ success: true, data: user, message: 'User profile retrieved' });
    } catch (error) {
        console.error('GetMe Error:', error);
        res.status(error.cause || 500).json({ success: false, data: null, message: error.message });
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) {
            return res.status(400).json({ success: false, data: null, message: 'Google Access Token required' });
        }

        const { user, token } = await authService.googleLoginUser(accessToken);

        res.cookie('jwt', token, COOKIE_OPTIONS);

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                businessDetails: user.businessDetails
            },
            message: 'Google login successful'
        });
    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(error.cause || 500).json({ success: false, data: null, message: error.message || 'Google Auth Failed' });
    }
};
