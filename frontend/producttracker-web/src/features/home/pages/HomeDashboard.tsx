import { useEffect, useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { metricsApi } from "../../../api/metrics.api";
import type { ProductQuantityMetric, WareHouseStockMetric } from "../../../types/metrics";
import { useToast } from "../../../ui/ToastProvider";
import "./home.css";

export function HomeDashboard() {
    const { pushToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [productsQuantity, setProductsQuantity] = useState<ProductQuantityMetric[]>([]);
    const [wareHouseStock, setWareHouseStock] = useState<WareHouseStockMetric[]>([]);

    useEffect(() => {
        let active = true;
        async function load() {
            setLoading(true);
            try {
                const [productsRes, warehouseRes] = await Promise.all([
                    metricsApi.productsQuantity(),
                    metricsApi.wareHouseStock(),
                ]);

                if (!active) return;
                setProductsQuantity(productsRes.items ?? []);
                setWareHouseStock(warehouseRes.items ?? []);
            } catch (e: any) {
                pushToast({
                    status: e?.status ?? 500,
                    message: e?.message ?? "Failed to load metrics.",
                });
            } finally {
                if (active) setLoading(false);
            }
        }

        load();
        return () => {
            active = false;
        };
    }, [pushToast]);

    const productsData = useMemo(() => {
        return productsQuantity.map((item) => ({
            name: item.name,
            quantity: item.quantity,
        }));
    }, [productsQuantity]);

    const warehouseData = useMemo(() => {
        return wareHouseStock.map((item) => ({
            name: item.name,
            totalQuantity: item.totalQuantity,
        }));
    }, [wareHouseStock]);

    return (
        <div className="home-panel">
            <div className="home-panel-head">
                <div className="home-panel-title">Overview</div>
                <div className="home-panel-meta">
                    {loading ? "Loading..." : "Latest metrics"}
                </div>
            </div>

            <div className="home-tablewrap">
                <div className="home-metrics-grid">
                    <div className="home-metric-card">
                        <div className="home-metric-head">
                            <div className="home-metric-title">Product - Quantity</div>
                            <div className="home-metric-subtitle">
                                {productsData.length} products
                            </div>
                        </div>
                        <div className="home-metric-chart">
                            {productsData.length === 0 ? (
                                <div className="home-metric-empty">No product data.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={productsData} barSize={20}>
                                        <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                                        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }} />
                                        <YAxis tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{
                                                background: "rgba(10, 15, 26, 0.95)",
                                                border: "1px solid rgba(255,255,255,0.12)",
                                                borderRadius: 12,
                                                color: "#fff",
                                            }}
                                            cursor={{ fill: "rgba(79,124,255,0.12)" }}
                                        />
                                        <Bar dataKey="quantity" fill="url(#productGradient)" radius={[8, 8, 0, 0]} />
                                        <defs>
                                            <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.9} />
                                                <stop offset="95%" stopColor="#4f7cff" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="home-metric-card">
                        <div className="home-metric-head">
                            <div className="home-metric-title">WareHouse - Stock</div>
                            <div className="home-metric-subtitle">
                                {warehouseData.length} warehouses
                            </div>
                        </div>
                        <div className="home-metric-chart">
                            {warehouseData.length === 0 ? (
                                <div className="home-metric-empty">No warehouse data.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={warehouseData} barSize={20}>
                                        <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                                        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }} />
                                        <YAxis tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{
                                                background: "rgba(10, 15, 26, 0.95)",
                                                border: "1px solid rgba(255,255,255,0.12)",
                                                borderRadius: 12,
                                                color: "#fff",
                                            }}
                                            cursor={{ fill: "rgba(16,185,129,0.12)" }}
                                        />
                                        <Bar dataKey="totalQuantity" fill="#10b981" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
