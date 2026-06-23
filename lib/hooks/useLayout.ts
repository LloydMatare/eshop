import { useTheme } from "next-themes";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Layout = {
  drawerOpen: boolean;
};

const initialState: Layout = {
  drawerOpen: false,
};

export const layoutStore = create<Layout>()(
  persist(() => initialState, {
    name: "layoutStore",
  })
);

export default function useLayoutService() {
  const { theme, setTheme } = useTheme();
  const { drawerOpen } = layoutStore();

  return {
    theme: theme || "system",
    drawerOpen,
    toggleTheme: () => {
      setTheme(theme === "dark" ? "light" : "dark");
    },
    toggleDrawer: () => {
      layoutStore.setState({ drawerOpen: !drawerOpen });
    },
  };
}
