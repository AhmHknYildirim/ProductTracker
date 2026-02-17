import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { productsApi } from "../../../api/products.api";
import type { ListProductsQuery, ProductResponse } from "../../../types/product";
import { TableCard } from "../../../ui/TableCard";
import "./products.css";

type CssVarStyle = CSSProperties & { [key: string]: string | number };

export function ProductsPage() {
    const [items, setItems] = useState<ProductResponse[]>([]);
    const [total, setTotal] = useState(0);
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [revision, setRevision] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editSku, setEditSku] = useState("");
    const [editRevision, setEditRevision] = useState("");
    const [editQuantity, setEditQuantity] = useState(0);

    const query: ListProductsQuery = useMemo(
        () => ({
            q: q || undefined,
            sort: "-createdAt",
            page,
            pageSize,
        }),
        [q, page]
    );

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await productsApi.list(query);
            setItems(res.items);
            setTotal(res.total);
        } catch (e: any) {
            setError(e?.message ?? "Failed to load products");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [query]);

    async function onCreate(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            await productsApi.create({
                name,
                sku: sku.trim() ? sku.trim() : null,
                revision: revision.trim(),
                quantity: Number(quantity),
            });
            setName("");
            setSku("");
            setRevision("");
            setQuantity(0);
            setPage(1);
            await load();
        } catch (e: any) {
            setError(e?.message ?? "Create failed");
        }
    }

    async function onUpdate(id: string) {
        setError(null);
        try {
            await productsApi.update(id, {
                name: editName,
                sku: editSku.trim() ? editSku.trim() : null,
                revision: editRevision.trim(),
                quantity: Number(editQuantity),
            });
            setEditingId(null);
            await load();
        } catch (e: any) {
            setError(e?.message ?? "Update failed");
        }
    }

    async function onDelete(id: string) {
        if (!confirm("Bu urunu silmek istediginize emin misiniz?")) return;
        setError(null);
        try {
            await productsApi.delete(id);
            await load();
        } catch (e: any) {
            setError(e?.message ?? "Delete failed");
        }
    }

    function startEdit(product: ProductResponse) {
        setEditingId(product.id);
        setEditName(product.name);
        setEditSku(product.sku ?? "");
        setEditRevision(product.revision ?? "");
        setEditQuantity(product.quantity);
    }

    function cancelEdit() {
        setEditingId(null);
        setEditName("");
        setEditSku("");
        setEditRevision("");
        setEditQuantity(0);
    }

    function handleActionChange(productId: string, action: string, product: ProductResponse) {
        if (action === "update") {
            startEdit(product);
        } else if (action === "delete") {
            onDelete(productId);
        }
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const gridStyle: CssVarStyle = {
        "--table-cols": "minmax(160px, 2fr) 1fr 1fr 0.7fr 1.2fr 0.7fr",
    };

    return (
        <section className="prod-page">
            <header className="prod-hero">
                <div>
                    <p className="prod-eyebrow">Inventory</p>
                    <h1>Products</h1>
                    <p className="prod-lead">
                        Organize SKUs, track revisions, and keep product data consistent across
                        procurement and stock.
                    </p>
                </div>
                <div className="prod-kpis">
                    <div className="prod-kpi">
                        <span className="label">Total</span>
                        <strong>{total}</strong>
                        <span className="trend">All products</span>
                    </div>
                    <div className="prod-kpi">
                        <span className="label">Page</span>
                        <strong>{items.length}</strong>
                        <span className="trend">Showing</span>
                    </div>
                </div>
            </header>

            <div className="prod-controls">
                <div className="prod-search">
                    <input
                        value={q}
                        onChange={(e) => {
                            setPage(1);
                            setQ(e.target.value);
                        }}
                        placeholder="Search by name or SKU"
                        aria-label="Search products"
                    />
                    <span>?</span>
                </div>
                <button className="prod-btn ghost" type="button" onClick={load}>
                    Refresh
                </button>
            </div>

            <form onSubmit={onCreate} className="prod-form">
                <div className="prod-form-grid">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        required
                    />
                    <input
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="SKU (optional)"
                    />
                    <input
                        value={revision}
                        onChange={(e) => setRevision(e.target.value)}
                        placeholder="Revision"
                        required
                    />
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        placeholder="Qty"
                        min={0}
                    />
                    <button type="submit" className="prod-btn primary">
                        Add
                    </button>
                </div>
            </form>

            {error && <div className="prod-error">{error}</div>}

            <TableCard
                title="Products"
                meta={`Total: ${total}`}
            >
                <div className="table-grid table-grid-head" style={gridStyle as CSSProperties}>
                    <span>Name</span>
                    <span>SKU</span>
                    <span>Revision</span>
                    <span className="table-grid-right">Qty</span>
                    <span>Created</span>
                    <span></span>
                </div>

                {loading && (
                    <div className="table-grid table-grid-row table-grid-empty" style={gridStyle as CSSProperties}>
                        <div>Loading...</div>
                    </div>
                )}

                {!loading && items.length === 0 && (
                    <div className="table-grid table-grid-row table-grid-empty" style={gridStyle as CSSProperties}>
                        <div>No products found.</div>
                    </div>
                )}

                {!loading &&
                    items.map((p) =>
                        editingId === p.id ? (
                            <div key={p.id} className="table-grid table-grid-row" style={gridStyle as CSSProperties}>
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                                <input
                                    value={editSku}
                                    onChange={(e) => setEditSku(e.target.value)}
                                />
                                <input
                                    value={editRevision}
                                    onChange={(e) => setEditRevision(e.target.value)}
                                />
                                <input
                                    type="number"
                                    value={editQuantity}
                                    onChange={(e) => setEditQuantity(Number(e.target.value))}
                                    min={0}
                                />
                                <div className="table-grid-muted">
                                    {new Date(p.createdAt).toLocaleString()}
                                </div>
                                <div className="prod-actions">
                                    <button
                                        type="button"
                                        className="prod-btn primary small"
                                        onClick={() => onUpdate(p.id)}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        className="prod-btn ghost small"
                                        onClick={cancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div key={p.id} className="table-grid table-grid-row" style={gridStyle as CSSProperties}>
                                <div className="table-grid-strong">{p.name}</div>
                                <div>{p.sku ?? "-"}</div>
                                <div>{p.revision}</div>
                                <div className="table-grid-right">{p.quantity}</div>
                                <div className="table-grid-muted">
                                    {new Date(p.createdAt).toLocaleString()}
                                </div>
                                <div>
                                    <select
                                        className="prod-select"
                                        value=""
                                        onChange={(e) => handleActionChange(p.id, e.target.value, p)}
                                    >
                                        <option value="" disabled>
                                            Seciniz
                                        </option>
                                        <option value="update">Guncelle</option>
                                        <option value="delete">Sil</option>
                                    </select>
                                </div>
                            </div>
                        )
                    )}
            </TableCard>

            <div className="prod-footer">
                <span className="prod-subtext">
                    Total: {total} | Page {page}/{totalPages}
                </span>
                <div className="prod-pager">
                    <button
                        className="prod-btn ghost"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Prev
                    </button>
                    <button
                        className="prod-btn ghost"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        Next
                    </button>
                </div>
            </div>
        </section>
    );
}


