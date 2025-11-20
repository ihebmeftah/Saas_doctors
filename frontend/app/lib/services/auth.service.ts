import { apiService } from './api.service';
import { LoginFormData, RegisterFormData, AuthResponse, User } from '@/lib/models/auth.model';

class AuthService {
    async login(credentials: LoginFormData): Promise<AuthResponse> {
        const response = await apiService.getApi().post<AuthResponse>('/auth/login', credentials);

        if (response.data.token) {
            apiService.setToken(response.data.token);
        }

        return response.data;
    }

    async register(data: RegisterFormData): Promise<AuthResponse> {
        const response = await apiService.getApi().post<AuthResponse>('/auth/register', data);

        if (response.data.token) {
            apiService.setToken(response.data.token);
        }

        return response.data;
    }

    async getCurrentUser(): Promise<User> {
        const response = await apiService.getApi().get<User>('/auth/curr');
        return response.data;
    }

    logout(): void {
        apiService.removeToken();
    }

    isAuthenticated(): boolean {
        return !!apiService.getToken();
    }
}

export const authService = new AuthService();
