export enum FacturationStatus {
    DRAFT = 'draft',
    ISSUED = 'issued',
    PAID = 'paid',
    PARTIALLY_PAID = 'partially_paid',
    OVERDUE = 'overdue',
    CANCELLED = 'cancelled',
}

export interface Facturation {
    id: string;
    invoiceNumber: string;
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    clinique: {
        id: string;
        name: string;
    };
    totalAmount: number;
    paidAmount: number;
    taxAmount?: number;
    discountAmount: number;
    status: FacturationStatus;
    dueDate?: string;
    description?: string;
    rdv?: {
        id: string;
        rdvDate: string;
        reason: string;
    };
    remainingAmount?: number;
    createdAt: string;
    updatedAt: string;
}
