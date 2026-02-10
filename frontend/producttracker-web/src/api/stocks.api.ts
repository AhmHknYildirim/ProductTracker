import { http } from "./http";
import type {
    CreateStockRequest,
    ListStocksQuery,
    PagedResult,
    StockResponse,
    UpdateStockRequest,
} from "../types/stock";

function toQueryString(q: ListStocksQuery): string {
    const params = new URLSearchParams();

    if (q.productId) params.set("productId", q.productId);
    if (q.wareHouseId) params.set("wareHouseId", q.wareHouseId);
    if (q.page !== undefined) params.set("page", String(q.page));
    if (q.pageSize !== undefined) params.set("pageSize", String(q.pageSize));

    const qs = params.toString();
    return qs ? `?${qs}` : "";
}

export const stocksApi = {
    list: (query: ListStocksQuery) =>
        http.get<PagedResult<StockResponse>>(`/api/stocks${toQueryString(query)}`),

    create: (payload: CreateStockRequest) =>
        http.post<StockResponse>(`/api/stocks`, payload),

    update: (id: string, payload: UpdateStockRequest) =>
        http.put<StockResponse>(`/api/stocks/${id}`, payload),

    delete: (id: string) =>
        http.delete<void>(`/api/stocks/${id}`),
};
