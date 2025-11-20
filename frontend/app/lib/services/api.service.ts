import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.api.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    this.removeToken();
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    getToken(): string | null {
        return typeof window !== 'undefined'
            ? localStorage.getItem('access_token')
            : null;
    }

    setToken(token: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', token);
        }
    }

    removeToken(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
        }
    }

    getApi(): AxiosInstance {
        return this.api;
    }
}

export const apiService = new ApiService();
