import { http } from "./http";
import type { MetricsResponse, ProductQuantityMetric, WareHouseStockMetric } from "../types/metrics";

export const metricsApi = {
    productsQuantity: () =>
        http.get<MetricsResponse<ProductQuantityMetric>>("/api/metrics/products-quantity"),

    wareHouseStock: () =>
        http.get<MetricsResponse<WareHouseStockMetric>>("/api/metrics/warehouse-stock"),
};
