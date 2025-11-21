import { apiService } from './api.service';
import { Clinique, CreateCliniqueFormData } from '@/lib/models/clinique.model';

class CliniqueService {
    async getAll(): Promise<Clinique[]> {
        const response = await apiService.getApi().get<Clinique[]>('/clinique');
        return response.data;
    }

    async getById(id: string): Promise<Clinique> {
        const response = await apiService.getApi().get<Clinique>(`/clinique/${id}`);
        return response.data;
    }

    async create(data: CreateCliniqueFormData): Promise<Clinique> {
        const response = await apiService.getApi().post<Clinique>('/clinique', data);
        return response.data;
    }

    async update(id: string, data: Partial<CreateCliniqueFormData>): Promise<Clinique> {
        const response = await apiService.getApi().patch<Clinique>(`/clinique/${id}`, data);
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await apiService.getApi().delete(`/clinique/${id}`);
    }
}

export const cliniqueService = new CliniqueService();
