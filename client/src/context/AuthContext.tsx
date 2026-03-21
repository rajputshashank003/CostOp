import { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LOCAL_STORAGE } from "../utils/constants";

export interface User {
    id: number;
    email: string;
    name: string;
    avatar_url: string;
    google_id: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Hydrate state from localStorage strictly on mount
        const storedToken = localStorage.getItem(LOCAL_STORAGE.TOKEN);
        const storedUser = localStorage.getItem(LOCAL_STORAGE.USER);

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user data from local storage");
            }
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem(LOCAL_STORAGE.TOKEN, newToken);
        localStorage.setItem(LOCAL_STORAGE.USER, JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        navigate("/");
    };

    const logout = () => {
        localStorage.removeItem(LOCAL_STORAGE.TOKEN);
        localStorage.removeItem(LOCAL_STORAGE.USER);
        setToken(null);
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
