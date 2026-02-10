import { useEffect, useMemo, useState } from "react";
import { productsApi } from "../../../api/products.api";
import { stocksApi } from "../../../api/stocks.api";
import { warehousesApi } from "../../../api/warehouses.api";
import type { ProductResponse } from "../../../types/product";
import type { StockResponse } from "../../../types/stock";
import type { WareHouseResponse } from "../../../types/warehouse";
import { ConfirmModal } from "../../../ui/ConfirmModal";
import { useToast } from "../../../ui/ToastProvider";
import "../../home/pages/home.css";

export function WareHousesPage() {
    const { pushToast } = useToast();

    const [warehouses, setWarehouses] = useState<WareHouseResponse[]>([]);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [showWarehouseCreate, setShowWarehouseCreate] = useState(false);
    const [showWarehouseEdit, setShowWarehouseEdit] = useState(false);
    const [warehouseEditId, setWarehouseEditId] = useState<string | null>(null);
    const [warehouseName, setWarehouseName] = useState("");

    const [stocks, setStocks] = useState<StockResponse[]>([]);
    const [showStockCreate, setShowStockCreate] = useState(false);
    const [showStockEdit, setShowStockEdit] = useState(false);
    const [stockEditId, setStockEditId] = useState<string | null>(null);
    const [stockWarehouseId, setStockWarehouseId] = useState("");
    const [stockProductId, setStockProductId] = useState("");
    const [stockQty, setStockQty] = useState("0");

    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        cancelLabel: string;
        onConfirm: (() => void) | null;
    }>({
        open: false,
        title: "",
        message: "",
        confirmLabel: "Confirm",
        cancelLabel: "Cancel",
        onConfirm: null,
    });

    async function loadWarehouses() {
        setLoading(true);
        try {
            const res = await warehousesApi.list({ page: 1, pageSize: 200 });
            setWarehouses(res.items);
        } catch (e: any) {
            pushToast({
                status: e?.status ?? 500,
                message: e?.message ?? "Failed to load warehouses.",
            });
        } finally {
            setLoading(false);
        }
    }

    async function loadProducts() {
        try {
            const res = await productsApi.list({ page: 1, pageSize: 200, sort: "name" });
            setProducts(res.items);
        } catch (e: any) {
            pushToast({
                status: e?.status ?? 500,
                message: e?.message ?? "Failed to load products.",
            });
        }
    }

    async function loadStocks() {
        try {
            const res = await stocksApi.list({ page: 1, pageSize: 200 });
            setStocks(res.items);
        } catch (e: any) {
            pushToast({
                status: e?.status ?? 500,
                message: e?.message ?? "Failed to load stock.",
            });
        }
    }

    useEffect(() => {
        loadWarehouses();
        loadProducts();
        loadStocks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function resetWarehouseForm() {
        setWarehouseEditId(null);
        setWarehouseName("");
    }

    function openWarehouseCreate() {
        resetWarehouseForm();
        setShowWarehouseCreate(true);
    }

    function openWarehouseEdit(warehouse: WareHouseResponse) {
        setWarehouseEditId(warehouse.id);
        setWarehouseName(warehouse.name);
        setShowWarehouseEdit(true);
    }

    async function handleWarehouseCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!warehouseName.trim()) {
            pushToast({ status: 400, message: "Warehouse name is required." });
            return;
        }

        try {
            await warehousesApi.create({ name: warehouseName.trim() });
            setShowWarehouseCreate(false);
            resetWarehouseForm();
            await loadWarehouses();
            pushToast({ status: 201, message: "Warehouse created." });
        } catch (e: any) {
            pushToast({
                status: e?.status ?? 500,
                message: e?.message ?? "Failed to create warehouse.",
            });
        }
    }

    async function handleWarehouseUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (!warehouseEditId) return;
        if (!warehouseName.trim()) {
            pushToast({ status: 400, message: "Warehouse name is required." });
            return;
        }

        try {
            await warehousesApi.update(warehouseEditId, { name: warehouseName.trim() });
            setShowWarehouseEdit(false);
            resetWarehouseForm();
            await loadWarehouses();
            pushToast({ status: 200, message: "Warehouse updated." });
        } catch (e: any) {
            pushToast({
                status: e?.status ?? 500,
                message: e?.message ?? "Failed to update warehouse.",
            });
        }
    }

    function handleWarehouseDelete(id: string) {
        openConfirm({
            title: "Delete warehouse",
            message: "Bu depoyu silmek istediginize emin misiniz?",
            confirmLabel: "Delete",
            cancelLabel: "Cancel",
            onConfirm: async () => {
                try {
                    await warehousesApi.delete(id);
                    await loadStocks();
                    await loadWarehouses();
                    pushToast({ status: 200, message: "Warehouse deleted." });
                } catch (e: any) {
                    pushToast({
                        status: e?.status ?? 500,
                        message: e?.message ?? "Failed to delete warehouse.",
                    });
                }
            },
        });
    }

    function resetStockForm() {
        setStockEditId(null);
        setStockWarehouseId("");
        setStockProductId("");
        setStockQty("0");
    }

    function openStockCreate() {
        resetStockForm();
        setShowStockCreate(true);
    }

    function openStockEdit(stock: StockEntry) {
        setStockEditId(stock.id);
        setStockWarehouseId(stock.warehouseId);
        setStockProductId(stock.productId);
        setStockQty(String(stock.quantity));
        setShowStockEdit(true);
    }

    async function handleStockCreate(e: React.FormEvent) {
        e.preventDefault();
        const qty = Number(stockQty);

        if (!stockWarehouseId || !stockProductId) {
            pushToast({ status: 400, message: "Warehouse and product are required." });
            return;
        }

        if (Number.isNaN(qty)) {
            pushToast({ status: 400, message: "Quantity must be a valid number." });
            return;
        }

        try {
            await stocksApi.create({
                wareHouseId: stockWarehouseId,
                productId: stockProductId,
                quantity: qty,
            });
            await loadStocks();
            setShowStockCreate(false);
            resetStockForm();
            pushToast({ status: 201, message: "Stock created." });
        } catch (e: any) {
            pushToast({
                status: e?.status ?? 500,
                message: e?.message ?? "Failed to create stock.",
            });
        }
    }

    async function handleStockUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (!stockEditId) return;
        const qty = Number(stockQty);

        if (!stockWarehouseId || !stockProductId) {
            pushToast({ status: 400, message: "Warehouse and product are required." });
            return;
        }

        if (Number.isNaN(qty)) {
            pushToast({ status: 400, message: "Quantity must be a valid number." });
            return;
        }

        try {
            await stocksApi.update(stockEditId, {
                wareHouseId: stockWarehouseId,
                productId: stockProductId,
                quantity: qty,
            });
            await loadStocks();
            setShowStockEdit(false);
            resetStockForm();
            pushToast({ status: 200, message: "Stock updated." });
        } catch (e: any) {
            pushToast({
                status: e?.status ?? 500,
                message: e?.message ?? "Failed to update stock.",
            });
        }
    }

    function handleStockDelete(id: string) {
        openConfirm({
            title: "Delete stock",
            message: "Bu stok kaydini silmek istediginize emin misiniz?",
            confirmLabel: "Delete",
            cancelLabel: "Cancel",
            onConfirm: async () => {
                try {
                    await stocksApi.delete(id);
                    await loadStocks();
                    pushToast({ status: 200, message: "Stock deleted." });
                } catch (e: any) {
                    pushToast({
                        status: e?.status ?? 500,
                        message: e?.message ?? "Failed to delete stock.",
                    });
                }
            },
        });
    }

    function openConfirm({
        title,
        message,
        confirmLabel = "Confirm",
        cancelLabel = "Cancel",
        onConfirm,
    }: {
        title: string;
        message: string;
        confirmLabel?: string;
        cancelLabel?: string;
        onConfirm: () => void;
    }) {
        setConfirmState({
            open: true,
            title,
            message,
            confirmLabel,
            cancelLabel,
            onConfirm,
        });
    }

    function closeConfirm() {
        setConfirmState((prev) => ({ ...prev, open: false, onConfirm: null }));
    }

    const warehouseOptions = useMemo(() => {
        return [...warehouses].sort((a, b) => a.name.localeCompare(b.name));
    }, [warehouses]);

    const productOptions = useMemo(() => {
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
    }, [products]);

    return (
        <>
            <div className="home-panel">
                <div className="home-panel-head">
                    <div className="home-panel-title">WareHouses</div>
                    <div className="home-panel-meta">
                        {loading ? "Loading..." : `${warehouses.length} warehouses • ${stocks.length} stocks`}
                    </div>
                </div>

                <div className="home-tablewrap">
                    <div className="home-section">
                        <div className="home-section-head">
                            <div className="home-section-title">WareHouses</div>
                            <div className="home-section-actions">
                                <button className="home-btn" type="button" onClick={openWarehouseCreate}>
                                    Add Warehouse
                                </button>
                            </div>
                        </div>
                        <table className="home-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                            {warehouses.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="empty">
                                        No warehouses yet.
                                    </td>
                                </tr>
                            ) : (
                                warehouses.map((warehouse) => (
                                    <tr key={warehouse.id}>
                                        <td className="strong">{warehouse.name}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <div className="home-row-actions end">
                                                <button
                                                    className="home-btn ghost"
                                                    type="button"
                                                    onClick={() => openWarehouseEdit(warehouse)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="home-btn danger"
                                                    type="button"
                                                    onClick={() => handleWarehouseDelete(warehouse.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="home-section">
                        <div className="home-section-head">
                            <div className="home-section-title">Stock</div>
                            <div className="home-section-actions">
                                <button className="home-btn" type="button" onClick={openStockCreate}>
                                    Add Stock
                                </button>
                            </div>
                        </div>
                        <table className="home-table">
                            <thead>
                            <tr>
                                <th style={{ width: "25%" }}>WareHouse</th>
                                <th style={{ width: "25%" }}>Product</th>
                                <th style={{ width: "15%" }}>SKU</th>
                                <th style={{ width: "10%" }}>Qty</th>
                            <th style={{ width: "10%" }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {stocks.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="empty">
                                    No stock records yet.
                                </td>
                            </tr>
                        ) : (
                            stocks.map((stock) => (
                                <tr key={stock.id}>
                                    <td className="strong">{stock.wareHouseName}</td>
                                    <td>{stock.productName}</td>
                                    <td className="muted">{stock.productSku ?? "-"}</td>
                                    <td>{stock.quantity}</td>
                                    <td>
                                        <div className="home-row-actions">
                                            <button
                                                className="home-btn ghost"
                                                type="button"
                                                onClick={() => openStockEdit(stock)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="home-btn danger"
                                                type="button"
                                                onClick={() => handleStockDelete(stock.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>

            {showWarehouseCreate && (
                <div className="modal-overlay" onClick={() => setShowWarehouseCreate(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="form-title">Create warehouse</div>
                            <button className="home-btn ghost" type="button" onClick={() => setShowWarehouseCreate(false)}>
                                Close
                            </button>
                        </div>
                        <form onSubmit={handleWarehouseCreate}>
                            <div className="stack">
                                <div className="field">
                                    <label>Name</label>
                                    <input
                                        value={warehouseName}
                                        onChange={(e) => setWarehouseName(e.target.value)}
                                        placeholder="Warehouse name"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="home-btn" type="submit">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showWarehouseEdit && (
                <div className="modal-overlay" onClick={() => setShowWarehouseEdit(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="form-title">Update warehouse</div>
                            <button className="home-btn ghost" type="button" onClick={() => setShowWarehouseEdit(false)}>
                                Close
                            </button>
                        </div>
                        <form onSubmit={handleWarehouseUpdate}>
                            <div className="stack">
                                <div className="field">
                                    <label>Name</label>
                                    <input
                                        value={warehouseName}
                                        onChange={(e) => setWarehouseName(e.target.value)}
                                        placeholder="Warehouse name"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="home-btn" type="submit">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showStockCreate && (
                <div className="modal-overlay" onClick={() => setShowStockCreate(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="form-title">Create stock</div>
                            <button className="home-btn ghost" type="button" onClick={() => setShowStockCreate(false)}>
                                Close
                            </button>
                        </div>
                        <form onSubmit={handleStockCreate}>
                            <div className="stack">
                                <div className="field">
                                    <label>Warehouse</label>
                                    <select
                                        value={stockWarehouseId}
                                        onChange={(e) => setStockWarehouseId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select warehouse</option>
                                        {warehouseOptions.map((warehouse) => (
                                            <option key={warehouse.id} value={warehouse.id}>
                                                {warehouse.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Product</label>
                                    <select
                                        value={stockProductId}
                                        onChange={(e) => setStockProductId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select product</option>
                                        {productOptions.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            <div className="field">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={stockQty}
                                    onChange={(e) => setStockQty(e.target.value)}
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button className="home-btn" type="submit">
                                Create
                            </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showStockEdit && (
                <div className="modal-overlay" onClick={() => setShowStockEdit(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="form-title">Update stock</div>
                            <button className="home-btn ghost" type="button" onClick={() => setShowStockEdit(false)}>
                                Close
                            </button>
                        </div>
                        <form onSubmit={handleStockUpdate}>
                            <div className="stack">
                                <div className="field">
                                    <label>Warehouse</label>
                                    <select
                                        value={stockWarehouseId}
                                        onChange={(e) => setStockWarehouseId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select warehouse</option>
                                        {warehouseOptions.map((warehouse) => (
                                            <option key={warehouse.id} value={warehouse.id}>
                                                {warehouse.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Product</label>
                                    <select
                                        value={stockProductId}
                                        onChange={(e) => setStockProductId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select product</option>
                                        {productOptions.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            <div className="field">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={stockQty}
                                    onChange={(e) => setStockQty(e.target.value)}
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button className="home-btn" type="submit">
                                Update
                            </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmModal
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                confirmLabel={confirmState.confirmLabel}
                cancelLabel={confirmState.cancelLabel}
                onConfirm={() => {
                    confirmState.onConfirm?.();
                    closeConfirm();
                }}
                onCancel={closeConfirm}
            />
        </>
    );
}
