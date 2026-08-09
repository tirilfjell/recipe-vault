/**
 * Light and dark appearance.
 *
 * The theme is a single `data-theme` attribute on the document element, which
 * the stylesheet reads to swap the colour tokens. Keeping it to one attribute
 * means no component needs to know which theme is active.
 *
 * There are three choices, and "system" is the default: the app follows the
 * operating system until the user deliberately picks light or dark. Storing
 * "system" rather than storing nothing is what lets somebody go back to
 * following the system after having chosen.
 */

const STORAGE_KEY = "recipe-vault.theme";

export const THEME_LIGHT = "light";
export const THEME_DARK = "dark";
export const THEME_SYSTEM = "system";

/** The choices offered in the settings, in the order they are shown. */
export const THEME_CHOICES = [THEME_SYSTEM, THEME_LIGHT, THEME_DARK];

/** Stops listening to the operating system when the user picks a fixed theme. */
let unsubscribeSystem = null;

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
 * The stored choice: "system", "light" or "dark".
 *
 * This is what the settings screen marks as active. It is not necessarily the
 * theme on screen — under "system" that is whatever the operating system says.
 *
 * @returns {string}
 */
export function getThemeChoice() {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);

    if (THEME_CHOICES.includes(stored)) {
      return stored;
    }
  } catch {
    // localStorage can be unavailable; following the system still works.
  }

  return THEME_SYSTEM;
}

/**
 * The theme actually being shown, with "system" resolved to light or dark.
 * @returns {string}
 */
export function getTheme() {
  const choice = getThemeChoice();

  return choice === THEME_SYSTEM ? systemTheme() : choice;
}

/**
 * Writes the resolved theme onto the document element.
 * @param {string} resolved
 */
function paint(resolved) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = resolved;
  }
}

/**
 * Follows the operating system while the choice is "system", so the app changes
 * with it rather than only at the next reload.
 */
function watchSystem() {
  unsubscribeSystem?.();
  unsubscribeSystem = null;

  if (typeof window === "undefined" || !window.matchMedia) {
    return;
  }

  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => paint(systemTheme());

  query.addEventListener("change", onChange);
  unsubscribeSystem = () => query.removeEventListener("change", onChange);
}

/**
 * Applies a choice and remembers it.
 * @param {string} choice One of THEME_CHOICES.
 */
export function setTheme(choice) {
  const next = THEME_CHOICES.includes(choice) ? choice : THEME_SYSTEM;

  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, next);
  } catch {
    // The choice still applies for this visit even if it cannot be stored.
  }

  if (next === THEME_SYSTEM) {
    watchSystem();
    paint(systemTheme());
    return;
  }

  unsubscribeSystem?.();
  unsubscribeSystem = null;
  paint(next);
}

/** Applies the starting theme, before the first paint of the interface. */
export function applyInitialTheme() {
  if (getThemeChoice() === THEME_SYSTEM) {
    watchSystem();
  }

  paint(getTheme());
}
