export enum PaymentMethod {
    CASH = 'cash',
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    BANK_TRANSFER = 'bank_transfer',
    CHECK = 'check',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
}

export interface Payment {
    id: string;
    transactionId: string;
    facturation: {
        id: string;
        invoiceNumber: string;
        totalAmount: number;
    };
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    reference?: string;
    notes?: string;
    receiptUrl?: string;
    completedAt?: string;
    refundedAt?: string;
    createdAt: string;
    updatedAt: string;
}
