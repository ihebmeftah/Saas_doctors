export enum RdvStatus {
    PENDING = 'PENDING',
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface Consultation {
    examination: string;
    diagnosis?: string;
    treatment?: string;
}

export interface Rdv {
    id: string;
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    doctor: {
        id: string;
        firstName: string;
        lastName: string;
        speciality?: string;
    };
    clinique: {
        id: string;
        name: string;
        address?: string;
    };
    receptionist?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    reason: string;
    amount: number;
    rdvDate: string;
    status: RdvStatus;
    consultation?: Consultation;
    createdAt: string;
    updatedAt: string;
}
