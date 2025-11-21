import { apiService } from './api.service';
import { ClinicService } from '@/lib/models/clinique-services.model';

export interface CreateClinicServiceDto {
    name: string;
    description: string;
    price: number;
    durationMinutes?: number;
    cliniqueId: string;
}

class ClinicServiceService {
    async getAll(): Promise<ClinicService[]> {
        const response = await apiService.getApi().get<ClinicService[]>('/clinicservices');
        return response.data;
    }

    async getById(id: string): Promise<ClinicService> {
        const response = await apiService.getApi().get<ClinicService>(`/clinicservices/${id}`);
        return response.data;
    }

    async create(data: CreateClinicServiceDto): Promise<ClinicService> {
        const response = await apiService.getApi().post<ClinicService>('/clinicservices', data);
        return response.data;
    }

    async update(id: string, data: Partial<CreateClinicServiceDto>): Promise<ClinicService> {
        const response = await apiService.getApi().patch<ClinicService>(`/clinicservices/${id}`, data);
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await apiService.getApi().delete(`/clinicservices/${id}`);
    }
}

export const clinicServiceService = new ClinicServiceService();
