import { http } from "./http";
import type {
    CreatePurchaseRequestRequest,
    ListPurchaseRequestsQuery,
    PagedResult,
    PurchaseRequestResponse,
} from "../types/purchaseRequest";

function toQueryString(q: ListPurchaseRequestsQuery): string {
    const params = new URLSearchParams();

    if (q.q) params.set("q", q.q);
    if (q.status !== undefined) params.set("status", String(q.status));
    if (q.requestedByUserId) params.set("requestedByUserId", q.requestedByUserId);
    if (q.fromDate) params.set("fromDate", q.fromDate);
    if (q.toDate) params.set("toDate", q.toDate);
    if (q.sort) params.set("sort", q.sort);
    if (q.page !== undefined) params.set("page", String(q.page));
    if (q.pageSize !== undefined) params.set("pageSize", String(q.pageSize));

    const qs = params.toString();
    return qs ? `?${qs}` : "";
}

const PRIMARY_BASE = "/api/purchase-requests";
const FALLBACK_BASE = "/api/procurements/purchase-requests";

async function getWithFallback<T>(path: string): Promise<T> {
    try {
        return await http.get<T>(path);
    } catch (err) {
        const status = (err as Error & { status?: number }).status;
        if (status === 404 && path.startsWith(PRIMARY_BASE)) {
            const fallbackPath = path.replace(PRIMARY_BASE, FALLBACK_BASE);
            return await http.get<T>(fallbackPath);
        }
        throw err;
    }
}

async function postWithFallback<T>(path: string, payload: unknown): Promise<T> {
    try {
        return await http.post<T>(path, payload);
    } catch (err) {
        const status = (err as Error & { status?: number }).status;
        if (status === 404 && path.startsWith(PRIMARY_BASE)) {
            const fallbackPath = path.replace(PRIMARY_BASE, FALLBACK_BASE);
            return await http.post<T>(fallbackPath, payload);
        }
        throw err;
    }
}

export const purchaseRequestsApi = {
    list: (query: ListPurchaseRequestsQuery) =>
        getWithFallback<PagedResult<PurchaseRequestResponse>>(
            `${PRIMARY_BASE}${toQueryString(query)}`
        ),

    create: (payload: CreatePurchaseRequestRequest) =>
        postWithFallback<PurchaseRequestResponse>(PRIMARY_BASE, payload),
};
