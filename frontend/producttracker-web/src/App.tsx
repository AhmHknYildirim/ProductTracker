import { useState } from "react";
import { getToken } from "./api/token";
import AuthPage from "./features/auth/pages/AuthPage";
import { HomePage } from "./features/home/pages/HomePage";

export default function App() {
    const [authed, setAuthed] = useState(Boolean(getToken()));

    if (!authed) {
        return <AuthPage onSuccess={() => setAuthed(true)} />;
    }

    return <HomePage onLogout={() => setAuthed(false)} />;
}
