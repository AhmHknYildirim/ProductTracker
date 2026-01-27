import { http } from "./http";

export type LoginRequest = {
    userName: string;
    password: string;
};

export type RegisterRequest = {
    firstName: string;
    lastName: string;
    middleName?: string | null;
    userName: string;
    email: string;
    password: string;
};

export type AuthResponse = {
    accessToken: string;
};

export function login(payload: LoginRequest) {
    return http.post<AuthResponse>("/api/auth/login", payload);
}

export function register(payload: RegisterRequest) {
    return http.post<AuthResponse>("/api/auth/register", payload);
}
