import { useTheme } from "next-themes";

export default function useLayoutService() {
  const { theme, setTheme } = useTheme();

  return {
    theme: theme || "system",
    toggleTheme: () => {
      setTheme(theme === "dark" ? "light" : "dark");
    },
  };
}
