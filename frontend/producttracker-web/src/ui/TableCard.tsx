import type { ReactNode } from "react";
import "./table-card.css";

type TableCardProps = {
    title: ReactNode;
    meta?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
};

export function TableCard({ title, meta, actions, children, className }: TableCardProps) {
    return (
        <section className={`table-card ${className ?? ""}`.trim()}>
            <header className="table-card-head">
                <div>
                    <div className="table-card-title">{title}</div>
                    {meta && <div className="table-card-meta">{meta}</div>}
                </div>
                {actions && <div className="table-card-actions">{actions}</div>}
            </header>
            <div className="table-card-body">{children}</div>
        </section>
    );
}
