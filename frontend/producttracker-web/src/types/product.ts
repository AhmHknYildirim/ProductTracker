export type ProductResponse = {
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
    status: ProductStatusKind;
    createdAt: string;
};

export const ProductStatusKind = {
    Active: 0,
    Inactive: 1,
    Archived: 2,
} as const;

export type ProductStatusKind = (typeof ProductStatusKind)[keyof typeof ProductStatusKind];

export type CreateProductRequest = {
    name: string;
    sku?: string | null;
    quantity: number;
    status: ProductStatusKind;
};

export type UpdateProductRequest = {
    name: string;
    sku?: string | null;
    quantity: number;
    status: ProductStatusKind;
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
    status?: ProductStatusKind;
    statusId?: number;
    sort?: string;
    page?: number;
    pageSize?: number;
};
