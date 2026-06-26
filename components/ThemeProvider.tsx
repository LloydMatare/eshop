"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: string) {
  const root = document.documentElement;
  const resolved = theme === "system" ? getSystemTheme() : theme;
  root.classList.toggle("dark", resolved === "dark");
}

function getInitialTheme(): string {
  if (typeof window === "undefined") return "system";
  return localStorage.getItem("theme") || "system";
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<string>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") applyTheme("system");
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
