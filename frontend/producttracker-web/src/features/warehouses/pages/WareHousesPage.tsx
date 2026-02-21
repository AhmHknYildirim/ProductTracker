import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { productsApi } from "../../../api/products.api";
import { stocksApi } from "../../../api/stocks.api";
import { warehousesApi } from "../../../api/warehouses.api";
import type { ProductResponse } from "../../../types/product";
import type { StockResponse } from "../../../types/stock";
import type { WareHouseResponse } from "../../../types/warehouse";
import { ConfirmModal } from "../../../ui/ConfirmModal";
import { TableCard } from "../../../ui/TableCard";
import { useToast } from "../../../ui/ToastProvider";
import "../../home/pages/home.css";
import "./warehouses.css";

type CssVarStyle = CSSProperties & { [key: string]: string | number };

type StockEntry = StockResponse;

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
    const [stockWarehouseFilter, setStockWarehouseFilter] = useState("");
    const [stockProductFilter, setStockProductFilter] = useState("");
    const [openActionsKey, setOpenActionsKey] = useState<string | null>(null);

    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        cancelLabel: string;
        onConfirm: (() => void) | null;
    }>(
        {
            open: false,
            title: "",
            message: "",
            confirmLabel: "Confirm",
            cancelLabel: "Cancel",
            onConfirm: null,
        }
    );

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

    const filteredStocks = useMemo(() => {
        return stocks.filter((stock) => {
            if (stockWarehouseFilter && stock.warehouseId !== stockWarehouseFilter) {
                return false;
            }
            if (stockProductFilter && stock.productId !== stockProductFilter) {
                return false;
            }
            return true;
        });
    }, [stocks, stockWarehouseFilter, stockProductFilter]);

    const warehouseGrid: CssVarStyle = {
        "--table-cols": "minmax(180px, 2fr) 1fr",
    };

    const stockGrid: CssVarStyle = {
        "--table-cols": "minmax(160px, 2fr) 1.4fr 1fr 0.6fr 1fr",
    };

    return (
        <>
            <TableCard
                title="WareHouses"
                meta={loading ? "Loading..." : `${warehouses.length} warehouses • ${stocks.length} stocks`}
                className="wh-table-center"
                actions={
                    <button className="wh-btn primary" type="button" onClick={openWarehouseCreate}>
                        Add Warehouse
                    </button>
                }
            >
                <div className="table-grid table-grid-head" style={warehouseGrid as CSSProperties}>
                    <span>Name</span>
                    <span className="table-grid-right">Actions</span>
                </div>
                {warehouses.length === 0 ? (
                    <div className="table-grid table-grid-row table-grid-empty" style={warehouseGrid as CSSProperties}>
                        <div>No warehouses yet.</div>
                    </div>
                ) : (
                    warehouses.map((warehouse) => (
                        <div key={warehouse.id} className="table-grid table-grid-row" style={warehouseGrid as CSSProperties}>
                            <div className="table-grid-strong">{warehouse.name}</div>
                            <div className="table-grid-right">
                                <div className="wh-actions-cell">
                                    <button
                                        className="wh-actions-trigger"
                                        type="button"
                                        onClick={() =>
                                            setOpenActionsKey((current) =>
                                                current === `wh-${warehouse.id}` ? null : `wh-${warehouse.id}`
                                            )
                                        }
                                    >
                                        Actions
                                    </button>
                                    {openActionsKey === `wh-${warehouse.id}` && (
                                        <div className="wh-actions-menu">
                                            <button
                                                className="wh-actions-item"
                                                type="button"
                                                onClick={() => {
                                                    setOpenActionsKey(null);
                                                    openWarehouseEdit(warehouse);
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="wh-actions-item danger"
                                                type="button"
                                                onClick={() => {
                                                    setOpenActionsKey(null);
                                                    handleWarehouseDelete(warehouse.id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </TableCard>

            <div className="wh-spacer" />

            <TableCard
                title="Stock"
                className="wh-table-center"
                actions={
                    <div className="wh-actions">
                        <button
                            className="wh-btn ghost"
                            type="button"
                            onClick={() => {
                                setStockWarehouseFilter("");
                                setStockProductFilter("");
                            }}
                        >
                            Reset
                        </button>
                        <button className="wh-btn primary" type="button" onClick={openStockCreate}>
                            Add Stock
                        </button>
                    </div>
                }
            >
                <div className="wh-filters">
                    <div className="wh-filter">
                        <label>Warehouse</label>
                        <select
                            value={stockWarehouseFilter}
                            onChange={(e) => setStockWarehouseFilter(e.target.value)}
                            aria-label="Filter by warehouse"
                        >
                            <option value="">All warehouses</option>
                            {warehouseOptions.map((warehouse) => (
                                <option key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="wh-filter">
                        <label>Product</label>
                        <select
                            value={stockProductFilter}
                            onChange={(e) => setStockProductFilter(e.target.value)}
                            aria-label="Filter by product"
                        >
                            <option value="">All products</option>
                            {productOptions.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="table-grid table-grid-head" style={stockGrid as CSSProperties}>
                    <span>WareHouse</span>
                    <span>Product</span>
                    <span>SKU</span>
                    <span className="table-grid-right">Qty</span>
                    <span className="table-grid-right">Actions</span>
                </div>

                {filteredStocks.length === 0 ? (
                    <div className="table-grid table-grid-row table-grid-empty" style={stockGrid as CSSProperties}>
                        <div>No stock records yet.</div>
                    </div>
                ) : (
                    filteredStocks.map((stock) => (
                        <div key={stock.id} className="table-grid table-grid-row" style={stockGrid as CSSProperties}>
                            <div className="table-grid-strong">{stock.wareHouseName}</div>
                            <div>{stock.productName}</div>
                            <div className="table-grid-muted">{stock.productSku ?? "-"}</div>
                            <div className="table-grid-right">{stock.quantity}</div>
                            <div className="table-grid-right">
                                <div className="wh-actions-cell">
                                    <button
                                        className="wh-actions-trigger"
                                        type="button"
                                        onClick={() =>
                                            setOpenActionsKey((current) =>
                                                current === `st-${stock.id}` ? null : `st-${stock.id}`
                                            )
                                        }
                                    >
                                        Actions
                                    </button>
                                    {openActionsKey === `st-${stock.id}` && (
                                        <div className="wh-actions-menu">
                                            <button
                                                className="wh-actions-item"
                                                type="button"
                                                onClick={() => {
                                                    setOpenActionsKey(null);
                                                    openStockEdit(stock);
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="wh-actions-item danger"
                                                type="button"
                                                onClick={() => {
                                                    setOpenActionsKey(null);
                                                    handleStockDelete(stock.id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </TableCard>

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



