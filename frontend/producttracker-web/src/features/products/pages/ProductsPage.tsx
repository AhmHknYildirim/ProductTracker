import { useEffect, useMemo, useState } from "react";
import { productsApi } from "../../../api/products.api";
import type { ListProductsQuery, ProductResponse } from "../../../types/product";
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
        if (!confirm("Bu �r�n� silmek istedi�inize emin misiniz?")) return;
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
    return (
        <div style={{ maxWidth: 900, margin: "24px auto", padding: 16, fontFamily: "system-ui" }}>
            <h1 style={{ marginBottom: 12 }}>ProductTracker</h1>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                <input
                    value={q}
                    onChange={(e) => { setPage(1); setQ(e.target.value); }}
                    placeholder="Search (name or sku)..."
                    style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                />
                <button onClick={load} style={{ padding: "10px 14px", borderRadius: 10 }}>
                    Refresh
                </button>
            </div>
            <form onSubmit={onCreate} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        style={{ flex: 2, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                        required
                    />
                    <input
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="SKU (optional)"
                        style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                    />
                    <input
                        value={revision}
                        onChange={(e) => setRevision(e.target.value)}
                        placeholder="Revision"
                        style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                        required
                    />
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        placeholder="Qty"
                        style={{ width: 120, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                        min={0}
                    />
                    <button type="submit" style={{ padding: "10px 14px", borderRadius: 10 }}>
                        Add
                    </button>
                </div>
            </form>
            {error && (
                <div style={{ background: "#ffe8e8", border: "1px solid #ffb3b3", padding: 12, borderRadius: 12, marginBottom: 12 }}>
                    {error}
                </div>
            )}
            <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#fafafa" }}>
                            <th style={{ textAlign: "left", padding: 10 }}>Name</th>
                            <th style={{ textAlign: "left", padding: 10 }}>SKU</th>
                            <th style={{ textAlign: "left", padding: 10 }}>Revision</th>
                            <th style={{ textAlign: "right", padding: 10 }}>Qty</th>
                            <th style={{ textAlign: "left", padding: 10 }}>Created</th>
                            <th style={{ textAlign: "center", padding: 10, width: 120 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: 12 }}>Loading...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: 12 }}>No products</td></tr>
                        ) : (
                            items.map((p) => (
                                editingId === p.id ? (
                                    <tr key={p.id} style={{ borderTop: "1px solid #f0f0f0", background: "#f9f9f9" }}>
                                        <td style={{ padding: 10 }}>
                                            <input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #ddd" }}
                                            />
                                        </td>
                                        <td style={{ padding: 10 }}>
                                            <input
                                                value={editSku}
                                                onChange={(e) => setEditSku(e.target.value)}
                                                style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #ddd" }}
                                            />
                                        </td>
                                        <td style={{ padding: 10 }}>
                                            <input
                                                value={editRevision}
                                                onChange={(e) => setEditRevision(e.target.value)}
                                                style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #ddd" }}
                                            />
                                        </td>
                                        <td style={{ padding: 10, textAlign: "right" }}>
                                            <input
                                                type="number"
                                                value={editQuantity}
                                                onChange={(e) => setEditQuantity(Number(e.target.value))}
                                                style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #ddd", textAlign: "right" }}
                                                min={0}
                                            />
                                        </td>
                                        <td style={{ padding: 10 }}>{new Date(p.createdAt).toLocaleString()}</td>
                                        <td style={{ padding: 10, textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                                                <button
                                                    onClick={() => onUpdate(p.id)}
                                                    style={{
                                                        padding: "4px 10px",
                                                        borderRadius: 6,
                                                        background: "#4CAF50",
                                                        color: "white",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        fontSize: 12
                                                    }}
                                                >
                                                    ?
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    style={{
                                                        padding: "4px 10px",
                                                        borderRadius: 6,
                                                        background: "#f44336",
                                                        color: "white",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        fontSize: 12
                                                    }}
                                                >
                                                    ?
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={p.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                                        <td style={{ padding: 10 }}>{p.name}</td>
                                        <td style={{ padding: 10 }}>{p.sku ?? "-"}</td>
                                        <td style={{ padding: 10 }}>{p.revision}</td>
                                        <td style={{ padding: 10, textAlign: "right" }}>{p.quantity}</td>
                                        <td style={{ padding: 10 }}>{new Date(p.createdAt).toLocaleString()}</td>
                                        <td style={{ padding: 10, textAlign: "center" }}>
                                            <select
                                                value=""
                                                onChange={(e) => handleActionChange(p.id, e.target.value, p)}
                                                style={{
                                                    padding: "6px 10px",
                                                    borderRadius: 6,
                                                    border: "1px solid #ddd",
                                                    cursor: "pointer",
                                                    fontSize: 14,
                                                    background: "white"
                                                }}
                                            >
                                                <option value="" disabled>Se�iniz</option>
                                                <option value="update">G�ncelle</option>
                                                <option value="delete">Sil</option>
                                            </select>
                                        </td>
                                    </tr>
                                )
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, alignItems: "center" }}>
                <span>
                    Total: {total} � Page {page}/{totalPages}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                    <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        Prev
                    </button>
                    <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
