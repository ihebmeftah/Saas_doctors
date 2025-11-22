export interface ClinicService {
    id: string;
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    clinique?: {
        id: string;
        name: string;
        address?: string;
        phone?: string;
        email?: string;
    };
}