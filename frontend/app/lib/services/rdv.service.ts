import { apiService } from './api.service';
import { Rdv, RdvStatus } from '@/lib/models/rdv.model';

export interface DoctorStats {
    total: number;
    completed: number;
    pending: number;
    scheduled: number;
    inProgress: number;
    cancelled: number;
    appointments: Rdv[];
}

export interface ChangeStatusDto {
    status: RdvStatus;
    examination?: string;
    diagnosis?: string;
    treatment?: string;
}

export interface DoctorPatient {
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: number;
        age?: number;
        gender?: string;
    };
    lastConsultation: string;
    totalConsultations: number;
    lastDiagnosis?: string;
    lastTreatment?: string;
}

class RdvService {
    async getMyAppointments(): Promise<Rdv[]> {
        const response = await apiService.getApi().get<Rdv[]>('/rdv/my-appointments');
        return response.data;
    }

    async getDoctorAppointments(): Promise<Rdv[]> {
        const response = await apiService.getApi().get<Rdv[]>('/rdv/doctor-appointments');
        return response.data;
    }

    async getDoctorStats(): Promise<DoctorStats> {
        const response = await apiService.getApi().get<DoctorStats>('/rdv/doctor-stats');
        return response.data;
    }

    async getById(id: string): Promise<Rdv> {
        const response = await apiService.getApi().get<Rdv>(`/rdv/${id}`);
        return response.data;
    }

    async changeStatus(id: string, data: ChangeStatusDto): Promise<Rdv> {
        const response = await apiService.getApi().patch<Rdv>(`/rdv/${id}/change-status`, data);
        return response.data;
    }

    async getDoctorPatients(): Promise<DoctorPatient[]> {
        const response = await apiService.getApi().get<DoctorPatient[]>('/rdv/doctor-patients');
        return response.data;
    }

    async getReceptionistAppointments(): Promise<Rdv[]> {
        const response = await apiService.getApi().get<Rdv[]>('/rdv/receptionist-appointments');
        return response.data;
    }

    async create(data: {
        patientId: string;
        doctorId: string;
        cliniqueId: string;
        rdvDate: string;
        reason: string;
    }): Promise<Rdv> {
        const response = await apiService.getApi().post<Rdv>('/rdv', data);
        return response.data;
    }
}

export const rdvService = new RdvService();
