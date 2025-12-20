/**
 * Auth Context with React Context API
 * Manages authentication state throughout the app
 */

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import { authApi } from '../lib/api';
import { socketClient } from '../lib/socket';
import type { User, LoginCredentials, RegisterCredentials } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('token');
    });
    const [isLoading, setIsLoading] = useState(true);

    // Verify token on mount
    useEffect(() => {
        const verifyAuth = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const userData = await authApi.getMe();
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                // Connect to socket with token
                socketClient.connect(token);
            } catch {
                // Token invalid, clear auth state
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, [token]);

    const login = useCallback(async (credentials: LoginCredentials) => {
        const response = await authApi.login(credentials);
        const { user: userData, token: authToken } = response;

        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(authToken);
        setUser(userData);

        // Connect to socket
        socketClient.connect(authToken);
    }, []);

    const register = useCallback(async (credentials: RegisterCredentials) => {
        const response = await authApi.register(credentials);
        const { user: userData, token: authToken } = response;

        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(authToken);
        setUser(userData);

        // Connect to socket
        socketClient.connect(authToken);
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            socketClient.disconnect();
        }
    }, []);

    const updateUser = useCallback((updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
