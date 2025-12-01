import { apiService } from './api.service';
import { Facturation, FacturationStatus } from '@/lib/models/facturation.model';

export interface Payment {
    id: string;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    transactionId?: string;
}

export interface CreateFacturationDto {
    patientId: string;
    cliniqueId: string;
    rdvId?: string;
    totalAmount: number;
    taxAmount?: number;
    discountAmount?: number;
    dueDate?: string;
    description?: string;
}

export interface CreatePaymentDto {
    facturatationId: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
}

class FacturationService {
    async getMyInvoices(): Promise<Facturation[]> {
        const response = await apiService.getApi().get<Facturation[]>('/facturation/my-invoices');
        return response.data;
    }

    async getReceptionistInvoices(): Promise<Facturation[]> {
        const response = await apiService.getApi().get<Facturation[]>('/facturation/receptionist/invoices');
        return response.data;
    }

    async getCompletedAppointmentsWithoutInvoice(): Promise<any[]> {
        const response = await apiService.getApi().get<any[]>('/facturation/receptionist/completed-appointments');
        return response.data;
    }

    async getById(id: string): Promise<Facturation> {
        const response = await apiService.getApi().get<Facturation>(`/facturation/${id}`);
        return response.data;
    }

    async getByRdv(rdvId: string): Promise<Facturation> {
        const response = await apiService.getApi().get<Facturation>(`/facturation/rdv/${rdvId}`);
        return response.data;
    }

    async createInvoice(data: CreateFacturationDto): Promise<Facturation> {
        const response = await apiService.getApi().post<Facturation>('/facturation', data);
        return response.data;
    }

    async updateInvoiceStatus(id: string, status: FacturationStatus): Promise<Facturation> {
        const response = await apiService.getApi().patch<Facturation>(`/facturation/${id}/status`, { status });
        return response.data;
    }

    async deleteInvoice(id: string): Promise<void> {
        await apiService.getApi().delete(`/facturation/${id}`);
    }

    async createPayment(data: CreatePaymentDto): Promise<Payment> {
        const response = await apiService.getApi().post<Payment>('/payment', data);
        return response.data;
    }
}

export const facturationService = new FacturationService();
