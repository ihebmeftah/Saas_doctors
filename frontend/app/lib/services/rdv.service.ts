import { apiService } from './api.service';
import { Rdv } from '@/lib/models/rdv.model';

class RdvService {
    async getMyAppointments(): Promise<Rdv[]> {
        const response = await apiService.getApi().get<Rdv[]>('/rdv/my-appointments');
        return response.data;
    }

    async getById(id: string): Promise<Rdv> {
        const response = await apiService.getApi().get<Rdv>(`/rdv/${id}`);
        return response.data;
    }
}

export const rdvService = new RdvService();
