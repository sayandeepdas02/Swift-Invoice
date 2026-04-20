import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: Generates symmetric tokens securely
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

export const registerUser = async (userData) => {
    const { name, email, password, mobile, inviteToken } = userData;

    if (!name || !email || !password) {
        throw new Error('Name, email, and password are required', { cause: 400 });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists', { cause: 400 });
    }

    let parentUserId = null;
    let role = 'owner';

    if (inviteToken) {
        try {
            const decoded = jwt.verify(inviteToken, process.env.JWT_SECRET);
            if (decoded.email.toLowerCase() !== email.toLowerCase()) throw new Error('Invite email mismatch');
            parentUserId = decoded.inviterId;
            role = 'member';
        } catch (e) {
            throw new Error('Invalid or expired invite token', { cause: 400 });
        }
    }

    const user = await User.create({
        name,
        email,
        password,
        mobile: mobile || 'Not Provided',
        parentUserId,
        role
    });

    if (!user) {
        throw new Error('Invalid user data', { cause: 400 });
    }

    const token = generateToken(user._id);

    return { user, token };
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
        throw new Error('Invalid email or password', { cause: 401 });
    }

    const token = generateToken(user._id);

    return { user, token };
};

export const getUserById = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new Error('User not found', { cause: 404 });
    }
    return user;
};

export const googleLoginUser = async (accessToken) => {
    // Since custom buttons via useGoogleLogin respond with access_token, use the userinfo endpoint instead of verifyIdToken
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!response.ok) {
        throw new Error('Failed to verify Google access token', { cause: 400 });
    }

    const payload = await response.json();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (user) {
        // Upgrade existing user account if they sign in via Google
        if (!user.isGoogleAuth) {
            user.isGoogleAuth = true;
            user.googleId = googleId;
            await user.save();
        }
    } else {
        user = await User.create({
            name,
            email,
            isGoogleAuth: true,
            googleId,
            mobile: 'Not Provided' // Optional field filler
        });
    }

    const token = generateToken(user._id);

    return { user, token };
};

export const generateInviteToken = (inviterId, email) => {
    return jwt.sign({ inviterId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
