import { useCallback, useEffect, useState } from "react";
import { clearToken, getToken } from "./api/token";
import AuthPage from "./features/auth/pages/AuthPage";
import { HomeDashboard } from "./features/home/pages/HomeDashboard";
import { HomePage } from "./features/home/pages/HomePage";
import { PurchaseRequestsPage } from "./features/procurements/pages/PurchaseRequestsPage";
import { WareHousesPage } from "./features/warehouses/pages/WareHousesPage";
import { ToastProvider } from "./ui/ToastProvider";
import "./features/home/pages/home.css";
import "./ui/light-theme.css";
import "./ui/table-card.css";

export default function App() {
    const [authed, setAuthed] = useState(Boolean(getToken()));
    const [route, setRoute] = useState<"home" | "products" | "warehouses" | "procurements">(() => {
        const path = window.location.pathname;
        if (path.startsWith("/warehouses")) {
            return "warehouses";
        }
        if (path.startsWith("/products")) {
            return "products";
        }
        if (path.startsWith("/procurements")) {
            return "procurements";
        }
        return "home";
    });

    const navigate = useCallback((next: "home" | "products" | "warehouses" | "procurements") => {
        const path =
            next === "home"
                ? "/"
                : next === "warehouses"
                    ? "/warehouses"
                    : next === "procurements"
                        ? "/procurements"
                        : "/products";
        if (window.location.pathname !== path) {
            window.history.pushState(null, "", path);
        }
        setRoute(next);
    }, []);

    useEffect(() => {
        if (!authed) {
            if (window.location.pathname !== "/login") {
                window.history.replaceState(null, "", "/login");
            }
            return;
        }

        const path = window.location.pathname;
        const normalized = path.startsWith("/warehouses")
            ? "warehouses"
            : path.startsWith("/products")
                ? "products"
                : path.startsWith("/procurements")
                    ? "procurements"
                    : "home";
        const normalizedPath =
            normalized === "warehouses"
                ? "/warehouses"
                : normalized === "products"
                    ? "/products"
                    : normalized === "procurements"
                        ? "/procurements"
                        : "/";

        if (path !== normalizedPath) {
            window.history.replaceState(null, "", normalizedPath);
        }

        setRoute(normalized);
    }, [authed]);

    useEffect(() => {
        const handler = () => {
            if (!authed) {
                if (window.location.pathname !== "/login") {
                    window.history.replaceState(null, "", "/login");
                }
                return;
            }
            if (window.location.pathname.startsWith("/warehouses")) {
                setRoute("warehouses");
            } else if (window.location.pathname.startsWith("/products")) {
                setRoute("products");
            } else if (window.location.pathname.startsWith("/procurements")) {
                setRoute("procurements");
            } else {
                setRoute("home");
            }
        };

        window.addEventListener("popstate", handler);
        return () => window.removeEventListener("popstate", handler);
    }, [authed]);

    if (!authed) {
        return (
            <ToastProvider>
                <AuthPage
                    onSuccess={() => {
                        setAuthed(true);
                        navigate("home");
                    }}
                />
            </ToastProvider>
        );
    }

    return (
        <ToastProvider>
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
                            type="button"
                            className={route === "home" ? "active" : ""}
                            onClick={() => navigate("home")}
                        >
                            Home
                        </button>
                        <button
                            type="button"
                            className={route === "products" ? "active" : ""}
                            onClick={() => navigate("products")}
                        >
                            Products
                        </button>
                        <button
                            type="button"
                            className={route === "warehouses" ? "active" : ""}
                            onClick={() => navigate("warehouses")}
                        >
                            WareHouses
                        </button>
                        <button
                            type="button"
                            className={route === "procurements" ? "active" : ""}
                            onClick={() => navigate("procurements")}
                        >
                            Procurement
                        </button>
                    </nav>

                    <div className="home-actions">
                        <button
                            className="home-btn"
                            type="button"
                            onClick={() => {
                                clearToken();
                                setAuthed(false);
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <main className="home-main">
                    {route === "home" ? (
                        <HomeDashboard />
                    ) : route === "products" ? (
                        <HomePage />
                    ) : route === "procurements" ? (
                        <PurchaseRequestsPage />
                    ) : (
                        <WareHousesPage />
                    )}
                </main>
            </div>
        </ToastProvider>
    );
}
