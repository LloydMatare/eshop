import { useTheme } from "@/components/ThemeProvider";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function useLayoutService() {
  const { theme, setTheme } = useTheme();

  const resolved = theme === "system" ? getSystemTheme() : theme;

  return {
    theme: theme || "system",
    resolvedTheme: resolved,
    toggleTheme: () => {
      setTheme(resolved === "dark" ? "light" : "dark");
    },
  };
}
