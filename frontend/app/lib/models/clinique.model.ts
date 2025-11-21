import { z } from 'zod';
import { User } from './user.model';
import { ClinicService } from './clinique-services.model';

// Zod schemas for validation
export const createCliniqueSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    phone: z.string().min(8, 'Phone number is required'),
    email: z.string().email('Invalid email address'),
});

// TypeScript types
export type CreateCliniqueFormData = z.infer<typeof createCliniqueSchema>;

export interface Clinique {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    addedby?: {
        id: string;
        email: string;
    };
    doctors?: User[];
    receptionists?: User[];
    services?: ClinicService[];
}
