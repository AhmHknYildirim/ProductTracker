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
    const [openActionsKey, setOpenActionsKey] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createRequestDate, setCreateRequestDate] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [createDescription, setCreateDescription] = useState("");
    const [lines, setLines] = useState<CreatePurchaseRequestLineRequest[]>([
        { productId: "", quantity: 1, unitId: "", requiredDate: null, notes: "" },
    ]);
    const [activeTab, setActiveTab] = useState<"my-requests" | "approvals">("my-requests");
    const [approvals, setApprovals] = useState<PurchaseRequestResponse[]>([]);
    const [approvalsTotal, setApprovalsTotal] = useState(0);
    const [approvalsLoading, setApprovalsLoading] = useState(false);

    // Modal state for confirmation
    const [confirmingApprove, setConfirmingApprove] = useState<PurchaseRequestResponse | null>(null);
    const [confirmingReject, setConfirmingReject] = useState<PurchaseRequestResponse | null>(null);
    const [confirmingCancel, setConfirmingCancel] = useState<PurchaseRequestResponse | null>(null);
    const [confirmingSubmit, setConfirmingSubmit] = useState<{
        id: string;
        requestNumber?: string;
    } | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [cancelReason, setCancelReason] = useState("");

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

    async function loadApprovals(active: { value: boolean }) {
        setApprovalsLoading(true);
        try {
            const res = await purchaseRequestsApi.list({
                status: PurchaseRequestStatus.Submitted,
                sort: "-createdAt",
                page: 1,
                pageSize: 50,
            });
            if (!active.value) return;
            setApprovals(res.items);
            setApprovalsTotal(res.total);
        } catch (err) {
            if (!active.value) return;
            const typed = err as Error & { status?: number };
            toast.pushToast({
                message: typed.message || "Failed to load approval requests.",
                status: typed.status ?? 500,
            });
        } finally {
            if (!active.value) return;
            setApprovalsLoading(false);
        }
    }

    useEffect(() => {
        const active = { value: true };
        if (activeTab === "approvals") {
            loadApprovals(active);
        }
        return () => {
            active.value = false;
        };
    }, [activeTab, toast]);

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
        "--table-cols":
            "minmax(160px, 2fr) 1.1fr 0.5fr 0.8fr 0.9fr minmax(120px, 0.8fr)",
    };

    const approvalGridStyle: CssVarStyle = {
        "--table-cols":
            "minmax(160px, 2fr) 1.1fr 0.5fr 0.8fr 0.6fr minmax(130px, 0.8fr)",
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

    async function handleApprove(id: string) {
        try {
            await purchaseRequestsApi.approve(id);
            toast.pushToast({ status: 200, message: "Purchase request approved." });
            const active = { value: true };
            loadApprovals(active);
            if (openLinesRequest?.id === id) {
                setOpenLinesRequest(null);
            }
        } catch (err) {
            const typed = err as Error & { status?: number };
            toast.pushToast({
                message: typed.message || "Failed to approve request.",
                status: typed.status ?? 500,
            });
        }
    }

    async function handleReject(id: string, reason: string) {
        try {
            await purchaseRequestsApi.reject(id, reason);
            toast.pushToast({ status: 200, message: "Purchase request rejected." });
            const active = { value: true };
            loadApprovals(active);
            if (openLinesRequest?.id === id) {
                setOpenLinesRequest(null);
            }
        } catch (err) {
            const typed = err as Error & { status?: number };
            toast.pushToast({
                message: typed.message || "Failed to reject request.",
                status: typed.status ?? 500,
            });
        }
    }

    async function handleCancel(id: string) {
        try {
            await purchaseRequestsApi.cancel(id);
            toast.pushToast({ status: 200, message: "Purchase request cancelled." });
            const active = { value: true };
            loadRequests(active);
            if (openLinesRequest?.id === id) {
                setOpenLinesRequest(null);
            }
        } catch (err) {
            const typed = err as Error & { status?: number };
            toast.pushToast({
                message: typed.message || "Failed to cancel request.",
                status: typed.status ?? 500,
            });
        }
    }

    function openSubmitConfirm(id: string) {
        const match =
            items.find((item) => item.id === id) ??
            (openLinesRequest?.id === id ? openLinesRequest : null);
        setConfirmingSubmit({ id, requestNumber: match?.requestNumber });
    }

    async function handleSubmit(id: string) {
        try {
            await purchaseRequestsApi.submit(id);
            toast.pushToast({ status: 200, message: "Purchase request submitted." });
            const active = { value: true };
            loadRequests(active);
        } catch (err) {
            const typed = err as Error & { status?: number };
            toast.pushToast({
                message: typed.message || "Failed to submit request.",
                status: typed.status ?? 500,
            });
        }
    }

    function handleDraftActionChange(row: PurchaseRequestResponse, action: string) {
        setOpenActionsKey(null);
        if (action === "submit") {
            openSubmitConfirm(row.id);
            return;
        }
        if (action === "update") {
            toast.pushToast({ status: 400, message: "Update flow is not available yet." });
        }
    }

    const tabs = (
        <div className="pr-tabs">
            <button
                className={`tab-btn ${activeTab === "my-requests" ? "active" : ""}`}
                onClick={() => setActiveTab("my-requests")}
            >
                My Requests
            </button>
            <button
                className={`tab-btn ${activeTab === "approvals" ? "active" : ""}`}
                onClick={() => setActiveTab("approvals")}
            >
                Waiting for Approval
            </button>
        </div>
    );

    return (
        <section>
            {activeTab === "my-requests" && (
                <TableCard
                    title={
                        <div className="pr-card-title">
                            {tabs}
                            <div className="pr-card-label">Requests</div>
                        </div>
                    }
                    className="pr-table-center"
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
                            <button
                                type="button"
                                className="wh-btn primary"
                                onClick={() => setShowCreate(true)}
                            >
                                Add Request
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
                        <span className="table-grid-right">Actions</span>
                    </div>
                    {loading && (
                        <div
                            className="table-grid table-grid-row table-grid-empty"
                            style={gridStyle as CSSProperties}
                        >
                            <div className="pr-subtext">Loading...</div>
                        </div>
                    )}
                    {!loading && items.length === 0 && (
                        <div
                            className="table-grid table-grid-row table-grid-empty"
                            style={gridStyle as CSSProperties}
                        >
                            <div className="pr-subtext">No purchase requests found.</div>
                        </div>
                    )}
                    {!loading &&
                        items.map((row) => (
                            <div
                                key={row.id}
                                className="table-grid table-grid-row"
                                style={gridStyle as CSSProperties}
                            >
                                <div>
                                    <div className="pr-number">{row.requestNumber}</div>
                                    <div className="pr-subtext">{row.description ?? "-"}</div>
                                </div>
                                <div className="pr-subtext">
                                    {row.requestedByUserName?.trim()
                                        ? row.requestedByUserName
                                        : `${row.requestedByUserId.slice(0, 8)}...`}
                                </div>
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
                                <div className="table-grid-right">
                                    {(row.status === PurchaseRequestStatus.Draft ||
                                        row.status === PurchaseRequestStatus.Submitted) && (
                                        <div className="pr-actions-cell">
                                            <button
                                                type="button"
                                                className="pr-actions-trigger"
                                                onClick={() =>
                                                    setOpenActionsKey((current) =>
                                                        current === `my-${row.id}` ? null : `my-${row.id}`
                                                    )
                                                }
                                            >
                                                Actions
                                            </button>
                                            {openActionsKey === `my-${row.id}` && (
                                                <div className="pr-actions-menu">
                                                    {row.status === PurchaseRequestStatus.Draft && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="pr-actions-item"
                                                                onClick={() =>
                                                                    handleDraftActionChange(row, "submit")
                                                                }
                                                            >
                                                                Submit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="pr-actions-item"
                                                                onClick={() =>
                                                                    handleDraftActionChange(row, "update")
                                                                }
                                                            >
                                                                Update
                                                            </button>
                                                        </>
                                                    )}
                                                    {row.status === PurchaseRequestStatus.Submitted && (
                                                        <button
                                                            type="button"
                                                            className="pr-actions-item danger"
                                                            onClick={() => {
                                                                setOpenActionsKey(null);
                                                                setConfirmingCancel(row);
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                </TableCard>
            )}

            {activeTab === "approvals" && (
                <TableCard
                    title={
                        <div className="pr-card-title">
                            {tabs}
                            <div className="pr-card-label">Approvals</div>
                        </div>
                    }
                    className="pr-table-center"
                    meta={`Showing ${approvals.length} of ${approvalsTotal} results`}
                >
                    <div
                        className="table-grid table-grid-head"
                        style={approvalGridStyle as CSSProperties}
                    >
                        <span>Request</span>
                        <span>Requester</span>
                        <span>Lines</span>
                        <span>Date</span>
                        <span>Status</span>
                        <span className="table-grid-right">Actions</span>
                    </div>
                    {approvalsLoading && (
                        <div
                            className="table-grid table-grid-row table-grid-empty"
                            style={approvalGridStyle as CSSProperties}
                        >
                            <div className="pr-subtext">Loading...</div>
                        </div>
                    )}
                    {!approvalsLoading && approvals.length === 0 && (
                        <div
                            className="table-grid table-grid-row table-grid-empty"
                            style={approvalGridStyle as CSSProperties}
                        >
                            <div className="pr-subtext">No pending approvals found.</div>
                        </div>
                    )}
                    {!approvalsLoading &&
                        approvals.map((row) => (
                            <div
                                key={row.id}
                                className="table-grid table-grid-row"
                                style={approvalGridStyle as CSSProperties}
                            >
                                <div>
                                    <div className="pr-number">{row.requestNumber}</div>
                                    <div className="pr-subtext">{row.description ?? "-"}</div>
                                </div>
                                <div className="pr-subtext">
                                    {row.requestedByUserName?.trim()
                                        ? row.requestedByUserName
                                        : `${row.requestedByUserId.slice(0, 8)}...`}
                                </div>
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
                                <div className="table-grid-right">
                                    <div className="pr-actions-cell">
                                        <button
                                            type="button"
                                            className="pr-actions-trigger"
                                            onClick={() =>
                                                setOpenActionsKey((current) =>
                                                    current === `ap-${row.id}` ? null : `ap-${row.id}`
                                                )
                                            }
                                        >
                                            Actions
                                        </button>
                                        {openActionsKey === `ap-${row.id}` && (
                                            <div className="pr-actions-menu">
                                                <button
                                                    type="button"
                                                    className="pr-actions-item"
                                                    onClick={() => {
                                                        setOpenActionsKey(null);
                                                        setConfirmingApprove(row);
                                                    }}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    type="button"
                                                    className="pr-actions-item danger"
                                                    onClick={() => {
                                                        setOpenActionsKey(null);
                                                        setConfirmingReject(row);
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    type="button"
                                                    className="pr-actions-item warning"
                                                    onClick={() => {
                                                        setOpenActionsKey(null);
                                                        setConfirmingCancel(row);
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </TableCard>
            )}

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
                        {openLinesRequest.status === PurchaseRequestStatus.Submitted && activeTab === "approvals" && (
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="wh-btn primary"
                                    onClick={() => setConfirmingApprove(openLinesRequest)}
                                >
                                    Approve
                                </button>
                                <button
                                    type="button"
                                    className="wh-btn danger"
                                    onClick={() => setConfirmingReject(openLinesRequest)}
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                        {openLinesRequest.status === PurchaseRequestStatus.Draft && activeTab === "my-requests" && (
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="wh-btn primary"
                                    onClick={() => openSubmitConfirm(openLinesRequest.id)}
                                >
                                    Submit Request
                                </button>
                            </div>
                        )}
                        {openLinesRequest.status === PurchaseRequestStatus.Submitted &&
                            activeTab === "my-requests" && (
                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="wh-btn danger"
                                        onClick={() => setConfirmingCancel(openLinesRequest)}
                                    >
                                        Cancel Request
                                    </button>
                                </div>
                            )}
                    </div>
                </div>
            )}

            {confirmingApprove && (
                <div className="modal-overlay" onClick={() => setConfirmingApprove(null)}>
                    <div className="modal-card mini-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="form-title">Approve Request</div>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to approve request <strong>{confirmingApprove.requestNumber}</strong>?</p>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="wh-btn primary"
                                onClick={() => {
                                    handleApprove(confirmingApprove.id);
                                    setConfirmingApprove(null);
                                }}
                            >
                                Yes, Approve
                            </button>
                            <button
                                type="button"
                                className="wh-btn ghost"
                                onClick={() => setConfirmingApprove(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmingReject && (
                <div className="modal-overlay" onClick={() => setConfirmingReject(null)}>
                    <div className="modal-card mini-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="form-title">Reject Request</div>
                        </div>
                        <div className="modal-body stack">
                            <p>Are you sure you want to reject request <strong>{confirmingReject.requestNumber}</strong>?</p>
                            <div className="field">
                                <label>Rejection Reason</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Please enter why this request is being rejected..."
                                    rows={3}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="wh-btn danger"
                                onClick={() => {
                                    if (!rejectionReason.trim()) {
                                        toast.pushToast({ status: 400, message: "Reason is required." });
                                        return;
                                    }
                                    handleReject(confirmingReject.id, rejectionReason);
                                    setConfirmingReject(null);
                                    setRejectionReason("");
                                }}
                            >
                                Reject
                            </button>
                            <button
                                type="button"
                                className="wh-btn ghost"
                                onClick={() => {
                                    setConfirmingReject(null);
                                    setRejectionReason("");
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmingCancel && (
                <div className="modal-overlay" onClick={() => setConfirmingCancel(null)}>
                    <div className="modal-card mini-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="form-title">Cancel Request</div>
                        </div>
                        <div className="modal-body stack">
                            <p>
                                Are you sure you want to cancel request{" "}
                                <strong>{confirmingCancel.requestNumber}</strong>?
                            </p>
                            <div className="field">
                                <label>Cancel Reason</label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Optional reason for cancellation"
                                    rows={3}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="wh-btn danger"
                                onClick={() => {
                                    handleCancel(confirmingCancel.id);
                                    setConfirmingCancel(null);
                                    setCancelReason("");
                                }}
                            >
                                Cancel Request
                            </button>
                            <button
                                type="button"
                                className="wh-btn ghost"
                                onClick={() => {
                                    setConfirmingCancel(null);
                                    setCancelReason("");
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmingSubmit && (
                <div className="modal-overlay" onClick={() => setConfirmingSubmit(null)}>
                    <div className="modal-card mini-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="form-title">Submit Request</div>
                        </div>
                        <div className="modal-body">
                            <p>
                                Are you sure you want to submit request{" "}
                                <strong>{confirmingSubmit.requestNumber ?? "-"}</strong>?
                            </p>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                className="wh-btn primary"
                                onClick={() => {
                                    handleSubmit(confirmingSubmit.id);
                                    setConfirmingSubmit(null);
                                }}
                            >
                                Yes, Submit
                            </button>
                            <button
                                type="button"
                                className="wh-btn ghost"
                                onClick={() => setConfirmingSubmit(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
