'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginFormData } from '@/lib/models/auth.model';
import { authService } from '@/lib/services/auth.service';
import { useAuth } from '@/lib/contexts/auth.context';

export function useLogin() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { setUser } = useAuth();

    const login = async (credentials: LoginFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.login(credentials);
            // Extract user data from response (backend returns user fields directly)
            const { token, password, ...userData } = response;
            setUser(userData);
            router.push('/dashboard');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { login, isLoading, error };
}
