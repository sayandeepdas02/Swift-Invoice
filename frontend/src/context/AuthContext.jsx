import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { authApi } from '../services/api/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const data = await authApi.getMe();
            setUser(data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            const data = await authApi.register(userData);
            setUser(data);
            toast.success('Registration successful!');
            return true;
        } catch (error) {
            toast.error(error.message || 'Registration failed');
            return false;
        }
    };

    const login = async (userData) => {
        try {
            const data = await authApi.login(userData);
            setUser(data);
            toast.success('Login successful!');
            return true;
        } catch (error) {
            toast.error(error.message || 'Login failed');
            return false;
        }
    };

    const loginWithGoogle = async (accessToken) => {
        try {
            const data = await authApi.googleLogin(accessToken);
            setUser(data);
            toast.success('Google login successful!');
            return true;
        } catch (error) {
            toast.error(error.message || 'Google login failed');
            return false;
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
            setUser(null);
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const value = {
        user,
        loading,
        register,
        login,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
