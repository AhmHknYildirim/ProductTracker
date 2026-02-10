import { http } from "./http";
import type {
    CreateProductRequest,
    ListProductsQuery,
    PagedResult,
    ProductResponse,
    UpdateProductRequest,
} from "../types/product";

function toQueryString(q: ListProductsQuery): string {
    const params = new URLSearchParams();

    if (q.q) params.set("q", q.q);
    if (q.sku) params.set("sku", q.sku);
    if (q.minQty !== undefined) params.set("minQty", String(q.minQty));
    if (q.maxQty !== undefined) params.set("maxQty", String(q.maxQty));
    if (q.status !== undefined) params.set("status", String(q.status));
    if (q.statusId !== undefined) params.set("statusId", String(q.statusId));
    if (q.sort) params.set("sort", q.sort);
    if (q.page !== undefined) params.set("page", String(q.page));
    if (q.pageSize !== undefined) params.set("pageSize", String(q.pageSize));

    const qs = params.toString();
    return qs ? `?${qs}` : "";
}

export const productsApi = {
    list: (query: ListProductsQuery) =>
        http.get<PagedResult<ProductResponse>>(`/api/products${toQueryString(query)}`),

    getById: (id: string) =>
        http.get<ProductResponse>(`/api/products/${id}`),

    create: (payload: CreateProductRequest) =>
        http.post<ProductResponse>(`/api/products`, payload),

    update: (id: string, payload: UpdateProductRequest) =>
        http.put<ProductResponse>(`/api/products/${id}`, payload),

    delete: (id: string) =>
        http.delete<void>(`/api/products/${id}`),
};
