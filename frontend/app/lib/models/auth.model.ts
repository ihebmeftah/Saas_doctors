import { z } from 'zod';

// Zod schemas for validation
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['DOCTOR', 'PATIENT', 'RECEPTIONIST', 'ADMIN']),
});

// TypeScript types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export interface AuthResponse {
    token: string;
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    role: string;
    password?: string;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    role: string;
}