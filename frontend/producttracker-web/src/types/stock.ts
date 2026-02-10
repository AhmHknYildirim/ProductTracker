export type StockResponse = {
    id: string;
    productId: string;
    productName: string;
    productSku: string | null;
    wareHouseId: string;
    wareHouseName: string;
    quantity: number;
};

export type CreateStockRequest = {
    productId: string;
    wareHouseId: string;
    quantity: number;
};

export type UpdateStockRequest = {
    productId: string;
    wareHouseId: string;
    quantity: number;
};

export type PagedResult<T> = {
    page: number;
    pageSize: number;
    total: number;
    items: T[];
};

export type ListStocksQuery = {
    productId?: string;
    wareHouseId?: string;
    page?: number;
    pageSize?: number;
};
