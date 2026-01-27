import { useEffect, useMemo, useState } from "react";
import { productsApi } from "../../../api/products.api";
import { clearToken, getToken } from "../../../api/token";
import type { ListProductsQuery, ProductResponse } from "../../../types/product";
import "./home.css";

type TabKey = "products" | "query";

export function HomePage({ onLogout }: { onLogout: () => void }) {
    const [tab, setTab] = useState<TabKey>("products");

    // Query state
    const [q, setQ] = useState("");
    const [sku, setSku] = useState("");
    const [minQty, setMinQty] = useState<string>("");
    const [maxQty, setMaxQty] = useState<string>("");
    const [sort, setSort] = useState<ListProductsQuery["sort"]>("name_asc");

    // Data state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<ProductResponse[]>([]);
    const [total, setTotal] = useState(0);

    // Paging
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const query: ListProductsQuery = useMemo(
        () => ({
            q: q.trim() || undefined,
            sku: sku.trim() || undefined,
            minQty: minQty === "" ? undefined : Number(minQty),
            maxQty: maxQty === "" ? undefined : Number(maxQty),
            sort: sort || undefined,
            page,
            pageSize,
        }),
        [q, sku, minQty, maxQty, sort, page, pageSize]
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
    }, [page, pageSize, sort]);

    function applyFilters() {
        setPage(1);
        load();
    }

    function resetFilters() {
        setQ("");
        setSku("");
        setMinQty("");
        setMaxQty("");
        setSort("name_asc");
        setPage(1);
        setPageSize(10);
        setTimeout(() => load(), 0);
    }

    function logout() {
        clearToken();
        onLogout();
    }

    const token = getToken();
    if (!token) {
        // defensive: if token is missing, force logout flow
        onLogout();
        return null;
    }

    return (
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
                    <button
                        className={tab === "products" ? "active" : ""}
                        onClick={() => setTab("products")}
                        type="button"
                    >
                        Products
                    </button>
                    <button
                        className={tab === "query" ? "active" : ""}
                        onClick={() => setTab("query")}
                        type="button"
                    >
                        Product Query
                    </button>
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
                        <div className="home-panel-title">
                            {tab === "products" ? "Products" : "Query filters"}
                        </div>
                        <div className="home-panel-meta">
                            {loading ? "Loading..." : `${total} total`}
                        </div>
                    </div>

                    {error && <div className="home-error">{error}</div>}

                    {tab === "query" && (
                        <div className="home-filters">
                            <div className="grid">
                                <div className="field">
                                    <label>Text</label>
                                    <input
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="Search by name..."
                                    />
                                </div>

                                <div className="field">
                                    <label>SKU</label>
                                    <input
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                        placeholder="Exact SKU..."
                                    />
                                </div>

                                <div className="field">
                                    <label>Min Qty</label>
                                    <input
                                        value={minQty}
                                        onChange={(e) => setMinQty(e.target.value)}
                                        placeholder="0"
                                        inputMode="numeric"
                                    />
                                </div>

                                <div className="field">
                                    <label>Max Qty</label>
                                    <input
                                        value={maxQty}
                                        onChange={(e) => setMaxQty(e.target.value)}
                                        placeholder="999"
                                        inputMode="numeric"
                                    />
                                </div>

                                <div className="field">
                                    <label>Sort</label>
                                    <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
                                        <option value="name_asc">Name (A → Z)</option>
                                        <option value="name_desc">Name (Z → A)</option>
                                        <option value="qty_desc">Quantity (High → Low)</option>
                                        <option value="qty_asc">Quantity (Low → High)</option>
                                        <option value="created_desc">Created (Newest)</option>
                                        <option value="created_asc">Created (Oldest)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="home-filter-actions">
                                <button className="home-btn" type="button" onClick={applyFilters} disabled={loading}>
                                    Apply
                                </button>
                                <button className="home-btn ghost" type="button" onClick={resetFilters} disabled={loading}>
                                    Reset
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="home-tablewrap">
                        <table className="home-table">
                            <thead>
                            <tr>
                                <th style={{ width: "50%" }}>Name</th>
                                <th style={{ width: "25%" }}>SKU</th>
                                <th style={{ width: "15%" }}>Quantity</th>
                                <th style={{ width: "10%" }}>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {!loading && items.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="empty">
                                        No products found.
                                    </td>
                                </tr>
                            )}

                            {items.map((p) => {
                                const status =
                                    p.quantity <= 0 ? "Out" : p.quantity <= 5 ? "Low" : "In";

                                return (
                                    <tr key={p.id}>
                                        <td className="strong">{p.name}</td>
                                        <td className="muted">{p.sku ?? "-"}</td>
                                        <td>{p.quantity}</td>
                                        <td>
                                            <span className={`pill ${status.toLowerCase()}`}>{status}</span>
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
    );
}
