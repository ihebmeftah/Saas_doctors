import { apiService } from './api.service';
import { User, UserRole } from '@/lib/models/user.model';

export interface CreateDoctorDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    speciality?: string;
}

export interface CreateReceptionistDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
}

export interface CreatePatientDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    age?: number;
    gender?: string;
    address?: string;
    cin?: string;
}

export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phone?: string;
    speciality?: string;
}

class UserService {
    async getAll(role?: UserRole): Promise<User[]> {
        const url = role ? `/users?role=${role}` : '/users';
        const response = await apiService.getApi().get<User[]>(url);
        return response.data;
    }

    async getById(id: string, role: UserRole): Promise<User> {
        const response = await apiService.getApi().get<User>(`/users/${role}/${id}`);
        return response.data;
    }

    async createDoctor(data: CreateDoctorDto): Promise<User> {
        const response = await apiService.getApi().post<User>('/users/create-doctor', data);
        return response.data;
    }

    async createReceptionist(data: CreateReceptionistDto): Promise<User> {
        const response = await apiService.getApi().post<User>('/users/create-recep', data);
        return response.data;
    }

    async createPatient(data: CreatePatientDto): Promise<User> {
        const response = await apiService.getApi().post<User>('/users/create-patient', data);
        return response.data;
    }

    async getDoctorsByClinic(clinicId: string): Promise<User[]> {
        const response = await apiService.getApi().get<User[]>(`/users/doctors-by-clinic/${clinicId}`);
        return response.data;
    }

    async getPatients(): Promise<User[]> {
        const response = await apiService.getApi().get<User[]>('/users/patients');
        return response.data;
    }

    async update(id: string, role: UserRole, data: UpdateUserDto): Promise<User> {
        const response = await apiService.getApi().patch<User>(`/users/${role}/${id}`, data);
        return response.data;
    }

    async delete(id: string, role: UserRole): Promise<void> {
        await apiService.getApi().delete(`/users/${role}/${id}`);
    }

    async getDeleted(role?: UserRole): Promise<User[]> {
        const url = role ? `/users/delete?role=${role}` : '/users/delete';
        const response = await apiService.getApi().get<User[]>(url);
        return response.data;
    }

    async restore(id: string, role: UserRole): Promise<void> {
        await apiService.getApi().patch(`/users/restore/${role}/${id}`);
    }
}

export const userService = new UserService();
