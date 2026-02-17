import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { purchaseRequestsApi } from "../../../api/purchaseRequests.api";
import { productsApi } from "../../../api/products.api";
import { unitsApi } from "../../../api/units.api";
import type {
    CreatePurchaseRequestLineRequest,
    PurchaseRequestResponse,
} from "../../../types/purchaseRequest";
import { PurchaseRequestStatus } from "../../../types/purchaseRequest";
import type { ProductResponse } from "../../../types/product";
import type { UnitResponse } from "../../../types/unit";
import { TableCard } from "../../../ui/TableCard";
import { useToast } from "../../../ui/ToastProvider";
import "./purchase-requests.css";

type CssVarStyle = CSSProperties & { [key: string]: string | number };

type DateRangeKey = "" | "7" | "30" | "90";

const STATUS_LABELS: Record<PurchaseRequestStatus, string> = {
    [PurchaseRequestStatus.Draft]: "Draft",
    [PurchaseRequestStatus.Submitted]: "Submitted",
    [PurchaseRequestStatus.Approved]: "Approved",
    [PurchaseRequestStatus.Rejected]: "Rejected",
    [PurchaseRequestStatus.Cancelled]: "Cancelled",
};

const STATUS_TONE: Record<PurchaseRequestStatus, string> = {
    [PurchaseRequestStatus.Draft]: "chip chip-draft",
    [PurchaseRequestStatus.Submitted]: "chip chip-submitted",
    [PurchaseRequestStatus.Approved]: "chip chip-approved",
    [PurchaseRequestStatus.Rejected]: "chip chip-rejected",
    [PurchaseRequestStatus.Cancelled]: "chip chip-cancelled",
};

function formatDate(value: string) {
    if (!value) return "-";
    return value.slice(0, 10);
}

function buildRange(range: DateRangeKey) {
    if (!range) return { fromDate: undefined, toDate: undefined };
    const days = Number(range);
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    const toDate = to.toISOString().slice(0, 10);
    const fromDate = from.toISOString().slice(0, 10);
    return { fromDate, toDate };
}

export function PurchaseRequestsPage() {
    const toast = useToast();
    const requestDateRef = useRef<HTMLInputElement | null>(null);
    const lineDateRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<PurchaseRequestStatus | "">("");
    const [range, setRange] = useState<DateRangeKey>("");
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<PurchaseRequestResponse[]>([]);
    const [total, setTotal] = useState(0);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [units, setUnits] = useState<UnitResponse[]>([]);
    const [openLinesId, setOpenLinesId] = useState<string | null>(null);
    const [openLinesRequest, setOpenLinesRequest] = useState<PurchaseRequestResponse | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createRequestDate, setCreateRequestDate] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [createDescription, setCreateDescription] = useState("");
    const [lines, setLines] = useState<CreatePurchaseRequestLineRequest[]>([
        { productId: "", quantity: 1, unitId: "", requiredDate: null, notes: "" },
    ]);

    useEffect(() => {
        function handleEsc(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpenLinesRequest(null);
            }
        }
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("keydown", handleEsc);
        };
    }, []);

    const query = useMemo(() => {
        const { fromDate, toDate } = buildRange(range);
        return {
            q: search || undefined,
            status: status === "" ? undefined : status,
            fromDate,
            toDate,
            sort: "-createdAt",
            page: 1,
            pageSize: 50,
        };
    }, [search, status, range]);

    async function loadRequests(active: { value: boolean }) {
        setLoading(true);
        try {
            const res = await purchaseRequestsApi.list(query);
            if (!active.value) return;
            setItems(res.items);
            setTotal(res.total);
        } catch (err) {
            if (!active.value) return;
            const typed = err as Error & { status?: number };
            toast.pushToast({
                message: typed.message || "Failed to load purchase requests.",
                status: typed.status ?? 500,
            });
        } finally {
            if (!active.value) return;
            setLoading(false);
        }
    }

    useEffect(() => {
        const active = { value: true };
        loadRequests(active);
        return () => {
            active.value = false;
        };
    }, [query, toast]);

    useEffect(() => {
        let active = true;
        productsApi
            .list({ page: 1, pageSize: 200, sort: "name" })
            .then((res) => {
                if (!active) return;
                setProducts(res.items);
            })
            .catch((err: Error & { status?: number }) => {
                if (!active) return;
                toast.pushToast({
                    message: err.message || "Failed to load products.",
                    status: err.status ?? 500,
                });
            });
        return () => {
            active = false;
        };
    }, [toast]);

    useEffect(() => {
        let active = true;
        unitsApi
            .list()
            .then((res) => {
                if (!active) return;
                setUnits(res);
            })
            .catch((err: Error & { status?: number }) => {
                if (!active) return;
                toast.pushToast({
                    message: err.message || "Failed to load units.",
                    status: err.status ?? 500,
                });
            });
        return () => {
            active = false;
        };
    }, [toast]);

    const gridStyle: CssVarStyle = {
        "--table-cols": "minmax(160px, 2fr) 1.2fr 0.6fr 0.8fr 0.9fr 0.6fr",
    };

    function resetCreateForm() {
        setCreateRequestDate(new Date().toISOString().slice(0, 10));
        setCreateDescription("");
        setLines([{ productId: "", quantity: 1, unitId: "", requiredDate: null, notes: "" }]);
    }

    function addLine() {
        setLines((prev) => [
            ...prev,
            { productId: "", quantity: 1, unitId: "", requiredDate: null, notes: "" },
        ]);
    }

    function updateLine(index: number, patch: Partial<CreatePurchaseRequestLineRequest>) {
        setLines((prev) =>
            prev.map((line, i) => (i === index ? { ...line, ...patch } : line))
        );
    }

    function removeLine(index: number) {
        setLines((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (lines.length === 0) {
            toast.pushToast({ status: 400, message: "At least one line is required." });
            return;
        }

        for (const line of lines) {
            if (!line.productId) {
                toast.pushToast({ status: 400, message: "Product is required for each line." });
                return;
            }
            if (!line.unitId) {
                toast.pushToast({ status: 400, message: "Unit is required for each line." });
                return;
            }
            if (!line.quantity || line.quantity <= 0) {
                toast.pushToast({ status: 400, message: "Quantity must be greater than 0." });
                return;
            }
        }

        setCreating(true);
        try {
            await purchaseRequestsApi.create({
                requestDate: createRequestDate,
                description: createDescription.trim() ? createDescription.trim() : null,
                lines: lines.map((line) => ({
                    productId: line.productId,
                    quantity: Number(line.quantity),
                    unitId: line.unitId,
                    requiredDate: line.requiredDate || null,
                    notes: line.notes?.trim() ? line.notes.trim() : null,
                })),
            });
            toast.pushToast({ status: 201, message: "Purchase request created." });
            setShowCreate(false);
            resetCreateForm();
            const active = { value: true };
            await loadRequests(active);
        } catch (err) {
            const typed = err as Error & { status?: number };
            toast.pushToast({
                message: typed.message || "Failed to create purchase request.",
                status: typed.status ?? 500,
            });
        } finally {
            setCreating(false);
        }
    }

    return (
        // <section className="pr-page">
        <section>
            {/*<header className="pr-hero">*/}
            {/*    <div className="pr-kpis">*/}
            {/*        <div className="pr-kpi">*/}
            {/*            <span className="label">Pending</span>*/}
            {/*            <strong>{items.filter((x) => x.status === PurchaseRequestStatus.Submitted).length}</strong>*/}
            {/*            <span className="trend">Submitted</span>*/}
            {/*        </div>*/}
            {/*        <div className="pr-kpi">*/}
            {/*            <span className="label">Approved</span>*/}
            {/*            <strong>{items.filter((x) => x.status === PurchaseRequestStatus.Approved).length}</strong>*/}
            {/*            <span className="trend">In this page</span>*/}
            {/*        </div>*/}
            {/*        <div className="pr-kpi">*/}
            {/*            <span className="label">Rejected</span>*/}
            {/*            <strong>{items.filter((x) => x.status === PurchaseRequestStatus.Rejected).length}</strong>*/}
            {/*            <span className="trend">In this page</span>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</header>*/}

            <TableCard
                title="Requests"
                meta={`Showing ${items.length} of ${total} results`}
                actions={
                    <div className="pr-head-actions">
                        <div className="pr-search">
                            <input
                                type="search"
                                placeholder="Search by number or description"
                                aria-label="Search purchase requests"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                            <span>
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M11 2a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 2a7 7 0 1 0 4.47 12.39l4.07 4.07 1.41-1.41-4.07-4.07A7 7 0 0 0 11 4Z" />
                                </svg>
                            </span>
                        </div>
                        <div className="pr-filters">
                            <select
                                aria-label="Status"
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value === ""
                                            ? ""
                                            : Number(event.target.value) as PurchaseRequestStatus
                                    )
                                }
                            >
                                <option value="">All statuses</option>
                                <option value={PurchaseRequestStatus.Draft}>Draft</option>
                                <option value={PurchaseRequestStatus.Submitted}>Submitted</option>
                                <option value={PurchaseRequestStatus.Approved}>Approved</option>
                                <option value={PurchaseRequestStatus.Rejected}>Rejected</option>
                                <option value={PurchaseRequestStatus.Cancelled}>Cancelled</option>
                            </select>
                            <select
                                aria-label="Date range"
                                value={range}
                                onChange={(event) => setRange(event.target.value as DateRangeKey)}
                            >
                                <option value="">Any date</option>
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                            </select>
                        </div>
                        <button type="button" className="wh-btn primary" onClick={() => setShowCreate(true)}>
                            New Request
                        </button>
                    </div>
                }
            >
                <div className="table-grid table-grid-head" style={gridStyle as CSSProperties}>
                    <span>Request</span>
                    <span>Requester</span>
                    <span>Lines</span>
                    <span>Date</span>
                    <span>Status</span>
                    <span></span>
                </div>
                {loading && (
                    <div className="table-grid table-grid-row table-grid-empty" style={gridStyle as CSSProperties}>
                        <div className="pr-subtext">Loading...</div>
                    </div>
                )}
                {!loading && items.length === 0 && (
                    <div className="table-grid table-grid-row table-grid-empty" style={gridStyle as CSSProperties}>
                        <div className="pr-subtext">No purchase requests found.</div>
                    </div>
                )}
                {!loading &&
                    items.map((row) => (
                        <div key={row.id} className="table-grid table-grid-row" style={gridStyle as CSSProperties}>
                            <div>
                                <div className="pr-number">{row.requestNumber}</div>
                                <div className="pr-subtext">{row.description ?? "-"}</div>
                            </div>
                            <div className="pr-subtext">{row.requestedByUserId.slice(0, 8)}...</div>
                            <div className={`pr-lines-cell ${openLinesId === row.id ? "open" : ""}`}>
                                <button
                                    type="button"
                                    className="pr-lines-trigger"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setOpenLinesId((prev) => (prev === row.id ? null : row.id));
                                        setOpenLinesRequest(row);
                                    }}
                                >
                                    {row.lines.length}
                                </button>
                            </div>
                            <div>{formatDate(row.requestDate)}</div>
                            <div className={STATUS_TONE[row.status]}>
                                {STATUS_LABELS[row.status]}
                            </div>
                            <div>
                                <button type="button" className="pr-link">
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
            </TableCard>

            {showCreate && (
                <div className="modal-overlay" onClick={() => setShowCreate(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="form-title">New purchase request</div>
                            <button
                                className="home-btn ghost"
                                type="button"
                                onClick={() => setShowCreate(false)}
                            >
                                Close
                            </button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="stack">
                                <div className="field">
                                    <label>Request date</label>
                                    <div className="date-input">
                                        <input
                                            ref={requestDateRef}
                                            type="date"
                                            value={createRequestDate}
                                            onChange={(e) => setCreateRequestDate(e.target.value)}
                                            onKeyDown={(e) => e.preventDefault()}
                                            onBeforeInput={(e) => e.preventDefault()}
                                            onPaste={(e) => e.preventDefault()}
                                            onFocus={() => {
                                                const el = requestDateRef.current as HTMLInputElement & {
                                                    showPicker?: () => void;
                                                };
                                                if (el?.showPicker) {
                                                    el.showPicker();
                                                } else {
                                                    el?.focus();
                                                }
                                            }}
                                            onClick={() => {
                                                const el = requestDateRef.current as HTMLInputElement & {
                                                    showPicker?: () => void;
                                                };
                                                if (el?.showPicker) {
                                                    el.showPicker();
                                                } else {
                                                    el?.focus();
                                                    el?.click();
                                                }
                                            }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="date-button"
                                            aria-label="Open calendar"
                                            onClick={() => {
                                                const el = requestDateRef.current as HTMLInputElement & {
                                                    showPicker?: () => void;
                                                };
                                                if (el?.showPicker) {
                                                    el.showPicker();
                                                } else {
                                                    el?.focus();
                                                }
                                            }}
                                        >
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1Zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9Zm-1-4H6a1 1 0 0 0-1 1v1h14V7a1 1 0 0 0-1-1Z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Description</label>
                                    <input
                                        value={createDescription}
                                        onChange={(e) => setCreateDescription(e.target.value)}
                                        placeholder="Optional description"
                                    />
                                </div>
                                <div className="pr-lines">
                                    <div className="pr-lines-head">
                                        <span>Lines</span>
                                        <button
                                            type="button"
                                            className="wh-btn ghost"
                                            onClick={addLine}
                                        >
                                            Add Line
                                        </button>
                                    </div>
                                    {lines.map((line, index) => (
                                        <div key={index} className="pr-line">
                                            <select
                                                value={line.productId}
                                                onChange={(e) => updateLine(index, { productId: e.target.value })}
                                                required
                                            >
                                                <option value="">Select product</option>
                                                {products.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min={0}
                                                value={line.quantity}
                                                onChange={(e) =>
                                                    updateLine(index, { quantity: Number(e.target.value) })
                                                }
                                                placeholder="Qty"
                                                required
                                            />
                                            <select
                                                value={line.unitId}
                                                onChange={(e) => updateLine(index, { unitId: e.target.value })}
                                                required
                                            >
                                                <option value="">Unit</option>
                                                {units.map((unit) => (
                                                    <option key={unit.id} value={unit.id}>
                                                        {unit.code} - {unit.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="date-input">
                                                <input
                                                    type="date"
                                                    ref={(el) => {
                                                        lineDateRefs.current[index] = el;
                                                    }}
                                                    value={line.requiredDate ?? ""}
                                                    onChange={(e) =>
                                                        updateLine(index, {
                                                            requiredDate: e.target.value || null,
                                                        })
                                                    }
                                                    onKeyDown={(e) => e.preventDefault()}
                                                    onBeforeInput={(e) => e.preventDefault()}
                                                    onPaste={(e) => e.preventDefault()}
                                                    onFocus={() => {
                                                        const el = lineDateRefs.current[index] as HTMLInputElement & {
                                                            showPicker?: () => void;
                                                        };
                                                        if (el?.showPicker) {
                                                            el.showPicker();
                                                        } else {
                                                            el?.focus();
                                                        }
                                                    }}
                                                    onClick={() => {
                                                        const el = lineDateRefs.current[index] as HTMLInputElement & {
                                                            showPicker?: () => void;
                                                        };
                                                        if (el?.showPicker) {
                                                            el.showPicker();
                                                        } else {
                                                            el?.focus();
                                                            el?.click();
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className="date-button"
                                                    aria-label="Open calendar"
                                                    onClick={() => {
                                                        const el = lineDateRefs.current[index] as HTMLInputElement & {
                                                            showPicker?: () => void;
                                                        };
                                                        if (el?.showPicker) {
                                                            el.showPicker();
                                                        } else {
                                                            el?.focus();
                                                        }
                                                    }}
                                                >
                                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                                        <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1Zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9Zm-1-4H6a1 1 0 0 0-1 1v1h14V7a1 1 0 0 0-1-1Z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <input
                                                value={line.notes ?? ""}
                                                onChange={(e) => updateLine(index, { notes: e.target.value })}
                                                placeholder="Notes"
                                            />
                                            <button
                                                type="button"
                                                className="wh-btn danger"
                                                onClick={() => removeLine(index)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="home-btn" type="submit" disabled={creating}>
                                    {creating ? "Saving..." : "Create"}
                                </button>
                                <button
                                    className="home-btn ghost"
                                    type="button"
                                    onClick={() => {
                                        setShowCreate(false);
                                        resetCreateForm();
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {openLinesRequest && (
                <div className="modal-overlay" onClick={() => setOpenLinesRequest(null)}>
                    <div className="modal-card pr-lines-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="form-title">
                                Lines - {openLinesRequest.requestNumber}
                            </div>
                            <button
                                className="home-btn ghost"
                                type="button"
                                onClick={() => setOpenLinesRequest(null)}
                            >
                                Close
                            </button>
                        </div>
                        <div className="modal-body">
                            {openLinesRequest.lines.length === 0 && (
                                <div className="pr-lines-empty">No lines.</div>
                            )}
                            {openLinesRequest.lines.map((line, index) => (
                                <div key={line.id ?? index} className="pr-lines-row">
                                    <div className="pr-lines-row-main">
                                        <div className="pr-lines-product">
                                            {line.productName ?? `${line.productId.slice(0, 8)}...`}
                                        </div>
                                        <div className="pr-lines-qty">
                                            {line.quantity} {line.unitCode ?? line.unitName ?? ""}
                                        </div>
                                    </div>
                                    <div className="pr-lines-row-meta">
                                        <span>
                                            Required:{" "}
                                            {line.requiredDate ? formatDate(line.requiredDate) : "-"}
                                        </span>
                                        <span>Notes: {line.notes ?? "-"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
