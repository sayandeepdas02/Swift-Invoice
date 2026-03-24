import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper: Generates symmetric tokens securely
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

export const registerUser = async (userData) => {
    const { name, email, password, mobile } = userData;

    if (!name || !email || !password || !mobile) {
        throw new Error('All fields are required', { cause: 400 });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists', { cause: 400 });
    }

    const user = await User.create({
        name,
        email,
        password,
        mobile
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
