/**
 * The screen navigation in the header.
 *
 * The signed-in area is split into three screens: the recipe browser, the saved
 * recipes and the settings. Only one is in the document flow at a time, which
 * keeps each screen to a single job and means a screen reader is never offered
 * the contents of a screen that is not showing.
 *
 * The current screen is kept in the URL hash, so the browser's back button works
 * and a screen can be linked to directly.
 */

import { t } from "../i18n/i18n.js";

export const SCREEN_BROWSE = "browse";
export const SCREEN_SAVED = "saved";
export const SCREEN_SETTINGS = "settings";

/** The screens, in the order they appear in the header. */
const SCREENS = [
  { id: SCREEN_BROWSE, labelKey: "browse.title" },
  { id: SCREEN_SAVED, labelKey: "saved.title" },
  { id: SCREEN_SETTINGS, labelKey: "settings.title" },
];

/**
 * Reads the screen from the URL, falling back to the browser.
 * @returns {string}
 */
function readScreenFromHash() {
  const fromHash = window.location.hash.replace("#", "");
  return SCREENS.some((screen) => screen.id === fromHash) ? fromHash : SCREEN_BROWSE;
}

/**
 * Creates the screen navigation.
 *
 * @param {object} options
 * @param {HTMLElement} options.navElement Holds the navigation buttons.
 * @param {Record<string, HTMLElement>} options.screens The screen elements, keyed by id.
 * @param {(screen: string) => void} [options.onChange] Called after a screen is shown.
 * @returns {{render: () => void, show: (screen: string) => void, getCurrent: () => string}}
 */
export function createScreenNav({ navElement, screens, onChange }) {
  let currentScreen = readScreenFromHash();

  /** Shows the current screen and hides the others. */
  function applyScreen() {
    Object.entries(screens).forEach(([id, element]) => {
      element.hidden = id !== currentScreen;
    });

    render();
    onChange?.(currentScreen);
  }

  /** Draws the navigation buttons for the current language and screen. */
  function render() {
    navElement.replaceChildren(
      ...SCREENS.map((screen) => {
        const isCurrent = screen.id === currentScreen;

        const link = document.createElement("a");
        link.className = `screen-nav__link${isCurrent ? " screen-nav__link--current" : ""}`;
        link.href = `#${screen.id}`;
        link.textContent = t(screen.labelKey);

        // aria-current is how a screen reader is told which screen is open. The
        // underline alone would not carry that.
        if (isCurrent) {
          link.setAttribute("aria-current", "page");
        }

        return link;
      }),
    );
  }

  // Real links plus a hashchange listener means the back button and a middle
  // click both behave the way they do anywhere else, with no click handling of
  // our own.
  window.addEventListener("hashchange", () => {
    currentScreen = readScreenFromHash();
    applyScreen();
  });

  return {
    render,

    /**
     * Shows one screen.
     * @param {string} screen
     */
    show(screen) {
      currentScreen = SCREENS.some((item) => item.id === screen) ? screen : SCREEN_BROWSE;
      applyScreen();
    },

    /** The screen currently showing. */
    getCurrent() {
      return currentScreen;
    },
  };
}
