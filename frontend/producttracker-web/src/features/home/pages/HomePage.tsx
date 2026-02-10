import { useEffect, useMemo, useState } from "react";
import { productsApi } from "../../../api/products.api";
import { warehousesApi } from "../../../api/warehouses.api";
import type { ListProductsQuery, ProductResponse } from "../../../types/product";
import type { WareHouseResponse } from "../../../types/warehouse";
import { ProductStatusKind } from "../../../types/product";
import { ConfirmModal } from "../../../ui/ConfirmModal";
import { useToast } from "../../../ui/ToastProvider";
import "./home.css";

export function HomePage() {
    // Query state
    const [q, setQ] = useState("");
    const [sku, setSku] = useState("");
    const [minQty, setMinQty] = useState<string>("");
    const [maxQty, setMaxQty] = useState<string>("");
    const [sort, setSort] = useState<ListProductsQuery["sort"]>("name_asc");
    const [statusFilter, setStatusFilter] = useState<"all" | ProductStatusKind>("all");

    // Data state
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<ProductResponse[]>([]);
    const [total, setTotal] = useState(0);
    const [formBusy, setFormBusy] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [openActionsId, setOpenActionsId] = useState<string | null>(null);
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
    const { pushToast } = useToast();

    // Warehouses state (for mapping)
    const [warehouses, setWarehouses] = useState<WareHouseResponse[]>([]);

    // Create form state
    const [createName, setCreateName] = useState("");
    const [createSku, setCreateSku] = useState("");
    const [createRevision, setCreateRevision] = useState("");
    const [createQty, setCreateQty] = useState<string>("0");
    const [createStatus, setCreateStatus] = useState<ProductStatusKind>(ProductStatusKind.Active);
    const [createWareHouseId, setCreateWareHouseId] = useState("");

    // Update form state
    const [editId, setEditId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editSku, setEditSku] = useState("");
    const [editRevision, setEditRevision] = useState("");
    const [editQty, setEditQty] = useState<string>("0");
    const [editStatus, setEditStatus] = useState<ProductStatusKind>(ProductStatusKind.Active);
    const [editWareHouseId, setEditWareHouseId] = useState("");

    // Paging
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const query: ListProductsQuery = useMemo(
        () => ({
            q: q.trim() || undefined,
            sku: sku.trim() || undefined,
            minQty: minQty === "" ? undefined : Number(minQty),
            maxQty: maxQty === "" ? undefined : Number(maxQty),
            statusId: statusFilter === "all" ? undefined : statusFilter,
            sort: sort || undefined,
            page,
            pageSize,
        }),
        [q, sku, minQty, maxQty, sort, page, pageSize, statusFilter]
    );

    async function load() {
        setLoading(true);
        try {
            const res = await productsApi.list(query);
            setItems(res.items);
            setTotal(res.total);
        } catch (e: any) {
            pushToast({
                status: e?.status ?? 500,
                message: e?.message ?? "Failed to load products.",
            });
        } finally {
            setLoading(false);
        }
    }

    async function loadWarehouses() {
        try {
            const res = await warehousesApi.list({ page: 1, pageSize: 200 });
            setWarehouses(res.items);
        } catch (e: any) {
            pushToast({
                status: e?.status ?? 500,
                message: e?.message ?? "Failed to load warehouses.",
            });
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, sort, q, sku, minQty, maxQty, statusFilter]);

    useEffect(() => {
        loadWarehouses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function applyFilters() {
        setPage(1);
        setTimeout(() => load(), 0);
    }

    function resetFilters() {
        setQ("");
        setSku("");
        setMinQty("");
        setMaxQty("");
        setSort("name_asc");
        setStatusFilter("all");
        setPage(1);
        setPageSize(10);
        setTimeout(() => load(), 0);
    }

    function startEdit(p: ProductResponse) {
        setEditId(p.id);
        setEditName(p.name);
        setEditSku(p.sku ?? "");
        setEditRevision(p.revision ?? "");
        setEditQty(String(p.quantity));
        setEditStatus(p.status);
        setEditWareHouseId(p.wareHouseId ?? "");
    }

    function clearEdit() {
        setEditId(null);
        setEditName("");
        setEditSku("");
        setEditRevision("");
        setEditQty("0");
        setEditStatus(ProductStatusKind.Active);
        setEditWareHouseId("");
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setFormBusy(true);

        if (!createRevision.trim()) {
            pushToast({ status: 400, message: "Revision is required." });
            setFormBusy(false);
            return;
        }

        const qty = Number(createQty);
        if (Number.isNaN(qty)) {
            pushToast({ status: 400, message: "Quantity must be a valid number." });
            setFormBusy(false);
            return;
        }

        try {
            await productsApi.create({
                name: createName.trim(),
                sku: createSku.trim() ? createSku.trim() : null,
                revision: createRevision.trim(),
                quantity: qty,
                wareHouseId: createWareHouseId ? createWareHouseId : null,
                status: createStatus,
            });
            setCreateName("");
            setCreateSku("");
            setCreateRevision("");
            setCreateQty("0");
            setCreateStatus(ProductStatusKind.Active);
            setCreateWareHouseId("");
            await load();
            pushToast({ status: 201, message: "Product created." });
        } catch (e: any) {
            pushToast({
                status: e?.status ?? 500,
                message: e?.message ?? "Failed to create product.",
            });
        } finally {
            setFormBusy(false);
        }
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (!editId) return;
        setFormBusy(true);

        if (!editRevision.trim()) {
            pushToast({ status: 400, message: "Revision is required." });
            setFormBusy(false);
            return;
        }

        const qty = Number(editQty);
        if (Number.isNaN(qty)) {
            pushToast({ status: 400, message: "Quantity must be a valid number." });
            setFormBusy(false);
            return;
        }

        try {
            await productsApi.update(editId, {
                name: editName.trim(),
                sku: editSku.trim() ? editSku.trim() : null,
                revision: editRevision.trim(),
                quantity: qty,
                wareHouseId: editWareHouseId ? editWareHouseId : null,
                status: editStatus,
            });
            await load();
            clearEdit();
            setShowUpdate(false);
            pushToast({ status: 200, message: "Product updated." });
        } catch (e: any) {
            pushToast({
                status: e?.status ?? 500,
                message: e?.message ?? "Failed to update product.",
            });
        } finally {
            setFormBusy(false);
        }
    }

    async function performDelete(id: string) {
        try {
            await productsApi.delete(id);
            if (editId === id) {
                clearEdit();
                setShowUpdate(false);
            }
            await load();
            pushToast({ status: 200, message: "Product deleted." });
        } catch (e: any) {
            pushToast({
                status: e?.status ?? 500,
                message: e?.message ?? "Failed to delete product.",
            });
        }
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

    function handleRowAction(action: string, product: ProductResponse) {
        setOpenActionsId(null);

        if (action === "update") {
            startEdit(product);
            setShowUpdate(true);
        } else if (action === "delete") {
            openConfirm({
                title: "Delete product",
                message: "Bu urunu silmek istediginize emin misiniz?",
                confirmLabel: "Delete",
                cancelLabel: "Cancel",
                onConfirm: () => {
                    performDelete(product.id);
                },
            });
        }
    }

    const skuOptions = useMemo(() => {
        const values = items
            .map((item) => item.sku)
            .filter((value): value is string => Boolean(value && value.trim()));
        return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
    }, [items]);

    const warehouseOptions = useMemo(() => {
        return [...warehouses].sort((a, b) => a.name.localeCompare(b.name));
    }, [warehouses]);

    const warehouseMap = useMemo(() => {
        return new Map(warehouses.map((warehouse) => [warehouse.id, warehouse]));
    }, [warehouses]);

    function statusLabel(status: ProductStatusKind) {
        switch (status) {
            case ProductStatusKind.Active:
                return "Active";
            case ProductStatusKind.Inactive:
                return "Inactive";
            case ProductStatusKind.Archived:
                return "Archived";
            default:
                return "Unknown";
        }
    }

    return (
        <>
            <div className="home-panel">
                <div className="home-panel-head">
                    <div className="home-panel-title">Products</div>
                    <div className="home-panel-meta">
                        {loading ? "Loading..." : `${total} total`}
                    </div>
                </div>

                <div className="home-tablewrap">
                    <div className="home-filters">
                        <div className="grid">
                            <div className="field">
                                <label>Name</label>
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search by name..."
                                />
                            </div>

                        <div className="field">
                            <label>SKU</label>
                            <select value={sku} onChange={(e) => setSku(e.target.value)}>
                                <option value="">All</option>
                                {skuOptions.map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label>Min Qty</label>
                            <input
                                value={minQty}
                                onChange={(e) => setMinQty(e.target.value)}
                                placeholder="0"
                                type="number"
                                min={0}
                                step={1}
                            />
                        </div>

                        <div className="field">
                            <label>Max Qty</label>
                            <input
                                value={maxQty}
                                onChange={(e) => setMaxQty(e.target.value)}
                                placeholder="999"
                                type="number"
                                min={0}
                                step={1}
                            />
                        </div>

                        <div className="field">
                            <label>Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value === "all"
                                            ? "all"
                                            : (Number(e.target.value) as ProductStatusKind)
                                    )
                                }
                            >
                                <option value="all">All</option>
                                <option value={ProductStatusKind.Active}>Active</option>
                                <option value={ProductStatusKind.Inactive}>Inactive</option>
                                <option value={ProductStatusKind.Archived}>Archived</option>
                            </select>
                        </div>
                        <div className="field">
                            <label>Actions</label>
                            <div className="home-filter-actions">
                                <button className="home-btn" type="button" onClick={applyFilters} disabled={loading}>
                                    Apply
                                </button>
                                <button className="home-btn ghost" type="button" onClick={resetFilters} disabled={loading}>
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                    <div className="home-tableactions">
                        <button className="home-btn" type="button" onClick={() => setShowCreate(true)}>
                            +
                        </button>
                    </div>
                    <table className="home-table">
                        <thead>
                        <tr>
                            <th style={{ width: "26%" }}>Name</th>
                            <th style={{ width: "14%" }}>SKU</th>
                            <th style={{ width: "12%" }}>Revision</th>
                            <th style={{ width: "18%" }}>WareHouse</th>
                            <th style={{ width: "10%" }}>Quantity</th>
                            <th style={{ width: "10%" }}>Status</th>
                            <th style={{ width: "10%" }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {!loading && items.length === 0 && (
                            <tr>
                                <td colSpan={7} className="empty">
                                    No products found.
                                </td>
                            </tr>
                        )}

                        {items.map((p) => {
                            const statusText = statusLabel(p.status);
                            const warehouse = p.wareHouseId ? warehouseMap.get(p.wareHouseId) : null;

                            return (
                                <tr key={p.id}>
                                    <td className="strong">{p.name}</td>
                                    <td className="muted">{p.sku ?? "-"}</td>
                                    <td className="muted">{p.revision}</td>
                                    <td className="muted">{warehouse?.name ?? p.wareHouseId ?? "-"}</td>
                                    <td>{p.quantity}</td>
                                    <td>
                                        <span className={`pill ${statusText.toLowerCase()}`}>{statusText}</span>
                                    </td>
                                    <td>
                                        <div className="home-actions-cell">
                                            <button
                                                className="home-actions-trigger"
                                                type="button"
                                                onClick={() =>
                                                    setOpenActionsId((current) => (current === p.id ? null : p.id))
                                                }
                                            >
                                                Actions
                                            </button>
                                            {openActionsId === p.id && (
                                                <div className="home-actions-menu">
                                                    <button
                                                        className="home-actions-item"
                                                        type="button"
                                                        onClick={() => handleRowAction("update", p)}
                                                    >
                                                        Update
                                                    </button>
                                                    <button
                                                        className="home-actions-item danger"
                                                        type="button"
                                                        onClick={() => handleRowAction("delete", p)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                <div className="home-footer">
                    <div className="pager">
                        <button
                            className="home-btn ghost"
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            Prev
                        </button>
                        <div className="pager-info">
                            Page <b>{page}</b>
                        </div>
                        <button
                            className="home-btn ghost"
                            type="button"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={loading || items.length < pageSize}
                        >
                            Next
                        </button>
                    </div>

                    <div className="pagesize">
                        <span className="muted">Page size</span>
                        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="form-title">Create product</div>
                            <button className="home-btn ghost" type="button" onClick={() => setShowCreate(false)}>
                                Close
                            </button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="stack">
                                <div className="field">
                                    <label>Name</label>
                                    <input
                                        value={createName}
                                        onChange={(e) => setCreateName(e.target.value)}
                                        placeholder="Product name"
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>SKU</label>
                                    <input
                                        value={createSku}
                                        onChange={(e) => setCreateSku(e.target.value)}
                                        placeholder="Optional SKU"
                                    />
                                </div>
                                <div className="field">
                                    <label>Revision</label>
                                    <input
                                        value={createRevision}
                                        onChange={(e) => setCreateRevision(e.target.value)}
                                        placeholder="Revision"
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>Quantity</label>
                                    <input
                                        value={createQty}
                                        onChange={(e) => setCreateQty(e.target.value)}
                                        inputMode="numeric"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>WareHouse</label>
                                    <select
                                        value={createWareHouseId}
                                        onChange={(e) => setCreateWareHouseId(e.target.value)}
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
                                    <label>Status</label>
                                    <select
                                        value={createStatus}
                                        onChange={(e) => setCreateStatus(Number(e.target.value) as ProductStatusKind)}
                                    >
                                        <option value={ProductStatusKind.Active}>Active</option>
                                        <option value={ProductStatusKind.Inactive}>Inactive</option>
                                        <option value={ProductStatusKind.Archived}>Archived</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="home-btn" type="submit" disabled={formBusy}>
                                    {formBusy ? "Saving..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showUpdate && (
                <div className="modal-overlay" onClick={() => setShowUpdate(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="form-title">Update product</div>
                            <button className="home-btn ghost" type="button" onClick={() => setShowUpdate(false)}>
                                Close
                            </button>
                        </div>
                        {!editId && <div className="form-hint">Pick a product in the table to edit.</div>}
                        <form onSubmit={handleUpdate}>
                            <div className="stack">
                                <div className="field">
                                    <label>Name</label>
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Product name"
                                        disabled={!editId}
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>SKU</label>
                                    <input
                                        value={editSku}
                                        onChange={(e) => setEditSku(e.target.value)}
                                        placeholder="Optional SKU"
                                        disabled={!editId}
                                    />
                                </div>
                                <div className="field">
                                    <label>Revision</label>
                                    <input
                                        value={editRevision}
                                        onChange={(e) => setEditRevision(e.target.value)}
                                        placeholder="Revision"
                                        disabled={!editId}
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>Quantity</label>
                                    <input
                                        value={editQty}
                                        onChange={(e) => setEditQty(e.target.value)}
                                        inputMode="numeric"
                                        placeholder="0"
                                        disabled={!editId}
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label>WareHouse</label>
                                    <select
                                        value={editWareHouseId}
                                        onChange={(e) => setEditWareHouseId(e.target.value)}
                                        disabled={!editId}
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
                                    <label>Status</label>
                                    <select
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(Number(e.target.value) as ProductStatusKind)}
                                        disabled={!editId}
                                    >
                                        <option value={ProductStatusKind.Active}>Active</option>
                                        <option value={ProductStatusKind.Inactive}>Inactive</option>
                                        <option value={ProductStatusKind.Archived}>Archived</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="home-btn" type="submit" disabled={!editId || formBusy}>
                                    {formBusy ? "Saving..." : "Update"}
                                </button>
                                <button
                                    className="home-btn ghost"
                                    type="button"
                                    onClick={clearEdit}
                                    disabled={!editId || formBusy}
                                >
                                    Clear
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
