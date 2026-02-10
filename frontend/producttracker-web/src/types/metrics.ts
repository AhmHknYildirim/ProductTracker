export type ProductQuantityMetric = {
    productId: string;
    name: string;
    quantity: number;
};

export type WareHouseStockMetric = {
    wareHouseId: string;
    name: string;
    totalQuantity: number;
};

export type MetricsResponse<T> = {
    items: T[];
};
