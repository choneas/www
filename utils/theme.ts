export const themeInitScript = `(() => {
  try {
    const storageKey = 'theme';
    const saved = localStorage.getItem(storageKey);
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved === 'light' || saved === 'dark' ? saved : (systemDark ? 'dark' : 'light');
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
  } catch {}
})();`;
