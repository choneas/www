export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const THEMES: Theme[] = ["light", "dark", "system"];

export const themeInitScript = `
(() => {
  const root = document.documentElement;
  const stored = localStorage.getItem("${THEME_STORAGE_KEY}");
  const theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  const resolved = theme === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;

  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
})();
`;
