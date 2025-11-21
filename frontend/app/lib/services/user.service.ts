import { apiService } from './api.service';
import { User, UserRole } from '@/lib/models/user.model';

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

    async delete(id: string): Promise<void> {
        await apiService.getApi().delete(`/users/${id}`);
    }
}

export const userService = new UserService();
