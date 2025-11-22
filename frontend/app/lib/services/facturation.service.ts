import { apiService } from './api.service';
import { Facturation } from '@/lib/models/facturation.model';

class FacturationService {
    async getMyInvoices(): Promise<Facturation[]> {
        const response = await apiService.getApi().get<Facturation[]>('/facturation/my-invoices');
        return response.data;
    }

    async getById(id: string): Promise<Facturation> {
        const response = await apiService.getApi().get<Facturation>(`/facturation/${id}`);
        return response.data;
    }
}

export const facturationService = new FacturationService();
