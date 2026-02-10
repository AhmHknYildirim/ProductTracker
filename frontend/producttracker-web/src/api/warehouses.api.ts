import { http } from "./http";
import type {
    CreateWareHouseRequest,
    ListWareHousesQuery,
    PagedResult,
    UpdateWareHouseRequest,
    WareHouseResponse,
} from "../types/warehouse";

function toQueryString(q: ListWareHousesQuery): string {
    const params = new URLSearchParams();

    if (q.q) params.set("q", q.q);
    if (q.page !== undefined) params.set("page", String(q.page));
    if (q.pageSize !== undefined) params.set("pageSize", String(q.pageSize));

    const qs = params.toString();
    return qs ? `?${qs}` : "";
}

export const warehousesApi = {
    list: (query: ListWareHousesQuery) =>
        http.get<PagedResult<WareHouseResponse>>(`/api/warehouses${toQueryString(query)}`),

    create: (payload: CreateWareHouseRequest) =>
        http.post<WareHouseResponse>(`/api/warehouses`, payload),

    update: (id: string, payload: UpdateWareHouseRequest) =>
        http.put<WareHouseResponse>(`/api/warehouses/${id}`, payload),

    delete: (id: string) =>
        http.delete<void>(`/api/warehouses/${id}`),
};
