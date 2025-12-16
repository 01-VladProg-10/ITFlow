import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia === "undefined")
    return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<Theme>(() => {
    // Використовуємо тільки системну тему
    if (typeof window === "undefined") return "light";
    const systemDark = getSystemPrefersDark();
    const initialTheme = systemDark ? "dark" : "light";
    applyThemeClass(initialTheme);
    return initialTheme;
  });

  useEffect(() => {
    // Слухач змін системної теми
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light";
      applyThemeClass(newTheme);
    };

    // Слухаємо зміни
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
