/**
 * Light and dark appearance.
 *
 * The theme is a single `data-theme` attribute on the document element, which
 * the stylesheet reads to swap the colour tokens. Keeping it to one attribute
 * means no component needs to know which theme is active.
 *
 * The choice is stored per device. Until the user picks one, the app follows the
 * operating system setting.
 */

const STORAGE_KEY = "recipe-vault.theme";

export const THEME_LIGHT = "light";
export const THEME_DARK = "dark";

/**
 * The theme the operating system asks for.
 * @returns {string}
 */
function systemTheme() {
  if (typeof window === "undefined") {
    return THEME_LIGHT;
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? THEME_DARK : THEME_LIGHT;
}

/**
 * The stored theme, or the system one when the user has not chosen.
 * @returns {string}
 */
export function getTheme() {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);

    if (stored === THEME_LIGHT || stored === THEME_DARK) {
      return stored;
    }
  } catch {
    // localStorage can be unavailable; the system preference still works.
  }

  return systemTheme();
}

/**
 * Applies a theme and remembers it.
 * @param {string} theme
 */
export function setTheme(theme) {
  const next = theme === THEME_DARK ? THEME_DARK : THEME_LIGHT;

  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = next;
  }

  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, next);
  } catch {
    // The theme still applies for this visit even if it cannot be stored.
  }
}

/** Applies the starting theme, before the first paint of the interface. */
export function applyInitialTheme() {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = getTheme();
  }
}
