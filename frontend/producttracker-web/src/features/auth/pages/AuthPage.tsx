import { useState } from "react";
import { login, register } from "../../../api/auth.api";
import { setToken } from "../../../api/token";
import "./auth.css";

type Mode = "login" | "register";

type ApiError = {
    message?: string;
    errors?: Record<string, string[]>;
};

export default function AuthPage({ onSuccess }: { onSuccess: () => void }) {
    const [mode, setMode] = useState<Mode>("login");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [email, setEmail] = useState("");

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res =
                mode === "login"
                    ? await login({ userName, password })
                    : await register({
                        firstName,
                        lastName,
                        middleName: middleName || null,
                        userName,
                        email,
                        password,
                    });

            setToken(res.accessToken);
            onSuccess();
        } catch (err: any) {
            const apiError = err as ApiError;

            if (apiError?.errors) {
                const first = Object.values(apiError.errors)[0]?.[0];
                setError(first ?? "Validation failed");
            } else {
                setError(apiError?.message ?? err.message ?? "Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-shell">
                {/* LEFT SIDE / HERO */}
                {/* LEFT SIDE / HERO */}
                <div className="auth-hero">

                    {/* BACKGROUND ANIMATION */}
                    <div className="hero-bg" aria-hidden="true">
                        <div className="globe" />
                        <svg className="routes" viewBox="0 0 900 360">
                            <path className="route r1" d="M80 250 C 220 120, 360 120, 520 210 S 770 260, 860 140" />
                            <path className="route r2" d="M70 140 C 210 220, 330 280, 470 220 S 700 90, 860 220" />
                            <path className="route r3" d="M130 300 C 260 260, 360 190, 470 170 S 690 170, 820 80" />

                            <circle className="cargo c1" r="4" />
                            <circle className="cargo c2" r="4" />
                            <circle className="cargo c3" r="4" />
                        </svg>
                    </div>

                    {/* FOREGROUND CONTENT */}
                    <div className="hero-content">
                        <div className="hero-kicker">Inventory & Workflow</div>

                        <h1 className="hero-title">ProductTracker</h1>

                        <p className="hero-subtitle">
                            A clean, fast inventory experience with user-scoped data and JWT authentication.
                            Track SKU, quantity and updates without friction.
                        </p>

                        <div className="hero-pills">
                            <span className="pill">JWT Auth</span>
                            <span className="pill">.NET 8 + PostgreSQL</span>
                            <span className="pill">Vite + React</span>
                        </div>
                    </div>

                    <p className="hero-footer">© {new Date().getFullYear()} ProductTracker</p>
                </div>

                {/* RIGHT SIDE / FORM */}
                <div className="auth-card">
                    <h2>{mode === "login" ? "Sign in" : "Create account"}</h2>

                    <div className="auth-tabs">
                        <button
                            type="button"
                            className={mode === "login" ? "active" : ""}
                            onClick={() => setMode("login")}
                        >
                            Sign in
                        </button>

                        <button
                            type="button"
                            className={mode === "register" ? "active" : ""}
                            onClick={() => setMode("register")}
                        >
                            Register
                        </button>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={submit}>
                        {mode === "register" && (
                            <>
                                <input
                                    placeholder="First name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />

                                <input
                                    placeholder="Last name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />

                                <input
                                    placeholder="Middle name (optional)"
                                    value={middleName}
                                    onChange={(e) => setMiddleName(e.target.value)}
                                />

                                <input
                                    placeholder="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </>
                        )}

                        <input
                            placeholder="Username"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />

                        <input
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button type="submit" disabled={loading}>
                            {loading
                                ? "Please wait..."
                                : mode === "login"
                                    ? "Sign in"
                                    : "Create account"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
