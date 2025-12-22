export type ProductResponse = {
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
    createdAt: string;
};

export type CreateProductRequest = {
    name: string;
    sku?: string | null;
    quantity: number;
};

export type UpdateProductRequest = {
    name: string;
    sku?: string | null;
    quantity: number;
};

export type PagedResult<T> = {
    page: number;
    pageSize: number;
    total: number;
    items: T[];
};

export type ListProductsQuery = {
    q?: string;
    sku?: string;
    minQty?: number;
    maxQty?: number;
    sort?: string;
    page?: number;
    pageSize?: number;
};
