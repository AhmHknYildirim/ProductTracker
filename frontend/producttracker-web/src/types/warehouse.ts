export type WareHouseResponse = {
    id: string;
    name: string;
};

export type CreateWareHouseRequest = {
    name: string;
};

export type UpdateWareHouseRequest = {
    name: string;
};

export type PagedResult<T> = {
    page: number;
    pageSize: number;
    total: number;
    items: T[];
};

export type ListWareHousesQuery = {
    q?: string;
    page?: number;
    pageSize?: number;
};
