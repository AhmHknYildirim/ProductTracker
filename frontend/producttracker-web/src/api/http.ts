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
        let payload: unknown = null;
        let message = text || `Request failed: ${res.status}`;

        try {
            payload = JSON.parse(text);
            if (typeof payload === "string") {
                message = payload;
            } else if (payload && typeof (payload as { message?: unknown }).message === "string") {
                message = (payload as { message: string }).message;
            }
        } catch {
            const match = text.match(/"message"\s*:\s*"([^"]+)"/);
            if (match) {
                message = match[1];
            }
        }

        const error = new Error(message);
        (error as Error & { status?: number; payload?: unknown }).status = res.status;
        (error as Error & { status?: number; payload?: unknown }).payload = payload;
        throw error;
    }

    if (res.status === 204) {
        return undefined as T;
    }

    const bodyText = await res.text();
    if (!bodyText) {
        return undefined as T;
    }

    return JSON.parse(bodyText) as T;
}

export const http = {
    get: <T>(path: string) => request<T>("GET", path),
    post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
    put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
    delete: <T>(path: string) => request<T>("DELETE", path),
};
