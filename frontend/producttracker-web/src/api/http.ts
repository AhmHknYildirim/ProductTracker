const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

function getToken(): string | null {
    return localStorage.getItem("access_token");
}

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const token = getToken();

    const res = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const text = await res.text();
        try {
            throw JSON.parse(text);
        } catch {
            throw new Error(text || `Request failed: ${res.status}`);
        }
    }

    return (await res.json()) as T;
}

export const http = {
    get: <T>(path: string) => request<T>("GET", path),
    post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
    put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
    delete: <T>(path: string) => request<T>("DELETE", path),
};
