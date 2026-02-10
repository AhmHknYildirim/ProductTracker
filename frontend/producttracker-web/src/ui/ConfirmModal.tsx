import "./confirm-modal.css";

type ConfirmModalProps = {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!open) return null;

    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-title">{title}</div>
                <div className="confirm-message">{message}</div>
                <div className="confirm-actions">
                    <button className="confirm-btn ghost" type="button" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button className="confirm-btn danger" type="button" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
