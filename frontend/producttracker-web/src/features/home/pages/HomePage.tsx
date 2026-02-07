import { useEffect, useMemo, useState } from "react";
import { productsApi } from "../../../api/products.api";
import { clearToken, getToken } from "../../../api/token";
import type { ListProductsQuery, ProductResponse } from "../../../types/product";
import { ProductStatusKind } from "../../../types/product";
import "./home.css";

export function HomePage({ onLogout }: { onLogout: () => void }) {

    // Query state
    const [q, setQ] = useState("");
    const [sku, setSku] = useState("");
    const [minQty, setMinQty] = useState<string>("");
    const [maxQty, setMaxQty] = useState<string>("");
    const [sort, setSort] = useState<ListProductsQuery["sort"]>("name_asc");
    const [statusFilter, setStatusFilter] = useState<"all" | ProductStatusKind>("all");

    // Data state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<ProductResponse[]>([]);
    const [total, setTotal] = useState(0);
    const [formBusy, setFormBusy] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);

    // Create form state
    const [createName, setCreateName] = useState("");
    const [createSku, setCreateSku] = useState("");
    const [createQty, setCreateQty] = useState<string>("0");
    const [createStatus, setCreateStatus] = useState<ProductStatusKind>(ProductStatusKind.Active);

    // Update form state
    const [editId, setEditId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editSku, setEditSku] = useState("");
    const [editQty, setEditQty] = useState<string>("0");
    const [editStatus, setEditStatus] = useState<ProductStatusKind>(ProductStatusKind.Active);

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
        setError(null);
        setLoading(true);
        try {
            const res = await productsApi.list(query);
            setItems(res.items);
            setTotal(res.total);
        } catch (e: any) {
            setError(e?.message ?? "Failed to load products.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, sort, q, sku, minQty, maxQty, statusFilter]);

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

    function logout() {
        clearToken();
        onLogout();
    }

    function startEdit(p: ProductResponse) {
        setEditId(p.id);
        setEditName(p.name);
        setEditSku(p.sku ?? "");
        setEditQty(String(p.quantity));
        setEditStatus(p.status);
    }

    function clearEdit() {
        setEditId(null);
        setEditName("");
        setEditSku("");
        setEditQty("0");
        setEditStatus(ProductStatusKind.Active);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        setFormBusy(true);

        const qty = Number(createQty);
        if (Number.isNaN(qty)) {
            setFormError("Quantity must be a valid number.");
            setFormBusy(false);
            return;
        }

        try {
            await productsApi.create({
                name: createName.trim(),
                sku: createSku.trim() ? createSku.trim() : null,
                quantity: qty,
                status: createStatus,
            });
            setCreateName("");
            setCreateSku("");
            setCreateQty("0");
            setCreateStatus(ProductStatusKind.Active);
            await load();
        } catch (e: any) {
            setFormError(e?.message ?? "Failed to create product.");
        } finally {
            setFormBusy(false);
        }
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (!editId) return;
        setFormError(null);
        setFormBusy(true);

        const qty = Number(editQty);
        if (Number.isNaN(qty)) {
            setFormError("Quantity must be a valid number.");
            setFormBusy(false);
            return;
        }

        try {
            await productsApi.update(editId, {
                name: editName.trim(),
                sku: editSku.trim() ? editSku.trim() : null,
                quantity: qty,
                status: editStatus,
            });
            await load();
            clearEdit();
            setShowUpdate(false);
        } catch (e: any) {
            setFormError(e?.message ?? "Failed to update product.");
        } finally {
            setFormBusy(false);
        }
    }

    const token = getToken();
    if (!token) {
        // defensive: if token is missing, force logout flow
        onLogout();
        return null;
    }

    const skuOptions = useMemo(() => {
        const values = items
            .map((item) => item.sku)
            .filter((value): value is string => Boolean(value && value.trim()));
        return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
    }, [items]);

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
        <div className="home-root">
            <header className="home-topbar">
                <div className="home-brand">
                    <div className="home-logo">PT</div>
                    <div>
                        <div className="home-title">ProductTracker</div>
                        <div className="home-subtitle">User-scoped inventory</div>
                    </div>
                </div>

                <nav className="home-tabs">
                    <div className="home-tablabel">Products</div>
                </nav>

                <div className="home-actions">
                    <button className="home-btn ghost" onClick={load} type="button" disabled={loading}>
                        Refresh
                    </button>
                    <button className="home-btn" onClick={logout} type="button">
                        Logout
                    </button>
                </div>
            </header>

            <main className="home-main">
                <div className="home-panel">
                    <div className="home-panel-head">
                        <div className="home-panel-title">Products</div>
                        <div className="home-panel-meta">
                            {loading ? "Loading..." : `${total} total`}
                        </div>
                    </div>

                    {error && <div className="home-error">{error}</div>}
                    {formError && <div className="home-error">{formError}</div>}

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
                                <th style={{ width: "40%" }}>Name</th>
                                <th style={{ width: "25%" }}>SKU</th>
                                <th style={{ width: "15%" }}>Quantity</th>
                                <th style={{ width: "10%" }}>Status</th>
                                <th style={{ width: "10%" }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {!loading && items.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="empty">
                                        No products found.
                                    </td>
                                </tr>
                            )}

                            {items.map((p) => {
                                const statusText = statusLabel(p.status);

                                return (
                                    <tr key={p.id}>
                                        <td className="strong">{p.name}</td>
                                        <td className="muted">{p.sku ?? "-"}</td>
                                        <td>{p.quantity}</td>
                                        <td>
                                            <span className={`pill ${statusText.toLowerCase()}`}>{statusText}</span>
                                        </td>
                                        <td>
                                            <button
                                                className="home-btn ghost"
                                                type="button"
                                                onClick={() => {
                                                    startEdit(p);
                                                    setShowUpdate(true);
                                                }}
                                            >
                                                Update
                                            </button>
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
            </main>
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
        </>
    );
}
