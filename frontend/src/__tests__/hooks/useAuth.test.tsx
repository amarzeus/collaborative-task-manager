/**
 * Unit tests for useAuth hook
 * Tests authentication context and state management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../../hooks/useAuth';

// Mock the API and socket modules
vi.mock('../../lib/api', () => ({
    authApi: {
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        getMe: vi.fn(),
    },
}));

vi.mock('../../lib/socket', () => ({
    socketClient: {
        connect: vi.fn(),
        disconnect: vi.fn(),
    },
}));

// Import mocked modules after mocking
import { authApi } from '../../lib/api';

// Wrapper component for the hook
const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
);

describe('useAuth Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Default mock to reject (no token)
        (authApi.getMe as any).mockRejectedValue(new Error('No token'));
    });

    /**
     * Test 1: Initial state when not authenticated
     */
    it('should have null user when not authenticated', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    /**
     * Test 2: Throws error when used outside provider
     */
    it('should throw error when used outside AuthProvider', () => {
        expect(() => {
            renderHook(() => useAuth());
        }).toThrow('useAuth must be used within an AuthProvider');
    });

    /**
     * Test 3: isAuthenticated is false when no user
     */
    it('should have isAuthenticated as false when no user', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.isAuthenticated).toBe(false);
    });

    /**
     * Test 4: Context provides required functions
     */
    it('should provide login, register, logout, and updateUser functions', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(typeof result.current.login).toBe('function');
        expect(typeof result.current.register).toBe('function');
        expect(typeof result.current.logout).toBe('function');
        expect(typeof result.current.updateUser).toBe('function');
    });
});
