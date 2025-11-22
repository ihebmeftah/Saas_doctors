import { apiService } from './api.service';
import { Payment } from '@/lib/models/payment.model';

class PaymentService {
    async getMyPayments(): Promise<Payment[]> {
        const response = await apiService.getApi().get<Payment[]>('/payment/my-payments');
        return response.data;
    }

    async getById(id: string): Promise<Payment> {
        const response = await apiService.getApi().get<Payment>(`/payment/${id}`);
        return response.data;
    }
}

export const paymentService = new PaymentService();
