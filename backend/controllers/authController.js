import * as authService from '../services/authService.js';
import { sendEmail } from '../services/emailService.js';
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

export const inviteTeamMember = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) throw new Error('Email is required to dispatch invite', { cause: 400 });

        const inviteToken = authService.generateInviteToken(req.user._id, email);
        const frontEndUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const inviteLink = `${frontEndUrl}/auth/register?inviteToken=${inviteToken}`;

        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2>You've been invited!</h2>
                <p><strong>${req.user.name}</strong> has invited you to join their Swift Invoice workspace.</p>
                <br />
                <a href="${inviteLink}" style="padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation & Join Team</a>
                <p style="margin-top: 32px; font-size: 14px; color: #666;">If you didn't expect this, you can safely ignore this email.</p>
            </div>
        `;

        await sendEmail({ to: email, subject: `You're invited to join ${req.user.name}'s Workspace`, html });

        res.json({ success: true, message: 'Invitation dispatched securely' });
    } catch (error) {
        console.error('Invite Dispatch Error:', error);
        res.status(error.cause || 500).json({ success: false, data: null, message: error.message });
    }
};
