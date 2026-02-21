export type PurchaseRequestLineResponse = {
    id: string;
    productId: string;
    productName?: string | null;
    quantity: number;
    unitId: string;
    unitCode: string;
    unitName: string;
    requiredDate: string | null;
    notes: string | null;
};

export const PurchaseRequestStatus = {
    Draft: 0,
    Submitted: 1,
    Approved: 2,
    Rejected: 3,
    Cancelled: 4,
} as const;
export type PurchaseRequestStatus =
    (typeof PurchaseRequestStatus)[keyof typeof PurchaseRequestStatus];

export type PurchaseRequestResponse = {
    id: string;
    requestNumber: string;
    requestedByUserId: string;
    requestedByUserName?: string | null;
    requestDate: string;
    status: PurchaseRequestStatus;
    description: string | null;
    createdAt: string;
    submittedAt: string | null;
    approvedByUserId: string | null;
    approvedAt: string | null;
    rejectionReason: string | null;
    lines: PurchaseRequestLineResponse[];
};

export type CreatePurchaseRequestLineRequest = {
    productId: string;
    quantity: number;
    unitId: string;
    requiredDate?: string | null;
    notes?: string | null;
};

export type CreatePurchaseRequestRequest = {
    requestDate: string;
    description?: string | null;
    lines: CreatePurchaseRequestLineRequest[];
};

export type PagedResult<T> = {
    page: number;
    pageSize: number;
    total: number;
    items: T[];
};

export type ListPurchaseRequestsQuery = {
    q?: string;
    status?: PurchaseRequestStatus;
    requestedByUserId?: string;
    fromDate?: string;
    toDate?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
};
