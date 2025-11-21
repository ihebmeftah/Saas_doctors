export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    RECEP = 'receptionist',
    DOCTOR = 'doctor',
    PATIENT = 'patient',
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: number;
    role: UserRole;
    createdAt?: string;
    updatedAt?: string;
    // Doctor specific
    speciality?: string;
    // Doctor and Receptionist
    clinique?: {
        id: string;
        name: string;
    };
    // Patient specific
    age?: number;
    address?: string;
    cin?: string;
    gender?: string;
}

export const roleLabels: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Super Admin',
    [UserRole.ADMIN]: 'Admin',
    [UserRole.RECEP]: 'Receptionist',
    [UserRole.DOCTOR]: 'Doctor',
    [UserRole.PATIENT]: 'Patient',
};

export const roleColors: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'purple',
    [UserRole.ADMIN]: 'blue',
    [UserRole.RECEP]: 'green',
    [UserRole.DOCTOR]: 'cyan',
    [UserRole.PATIENT]: 'gray',
};
