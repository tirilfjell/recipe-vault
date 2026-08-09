/**
 * The collapsing header and its menu button.
 *
 * On a small screen the header carries the brand, three navigation links and the
 * account controls, which is a lot of vertical space to give up while reading.
 * Once the page is scrolled, the header collapses to just the brand and a menu
 * button, and the rest is opened on demand.
 *
 * The collapse only applies below the width at which the header fits on one
 * line. Above it the links are always visible and the button is removed from the
 * document altogether, so it is never announced to a screen reader.
 */

import { t } from "../i18n/i18n.js";

/** How far the page must be scrolled before the header collapses, in pixels. */
const COLLAPSE_AFTER = 48;

/** The width from which the header fits on one line and never collapses. */
const WIDE_FROM = "(min-width: 60rem)";

/**
 * Creates the header menu.
 *
 * @param {object} options
 * @param {HTMLElement} options.header The site header.
 * @param {HTMLButtonElement} options.toggle The menu button.
 * @param {HTMLElement} options.menu The region the button opens.
 * @returns {{refreshLabels: () => void, close: () => void}}
 */
export function createHeaderMenu({ header, toggle, menu }) {
  const wide = window.matchMedia(WIDE_FROM);

  let isOpen = false;

  /** Whether the header is currently collapsed. */
  let isCollapsed = false;

  /** Writes the button's label for its current state. */
  function updateLabel() {
    toggle.setAttribute("aria-label", t(isOpen ? "app.closeMenu" : "app.openMenu"));
  }

  /**
   * Opens or closes the menu.
   * @param {boolean} next
   */
  function setOpen(next) {
    isOpen = next;
    toggle.setAttribute("aria-expanded", String(isOpen));
    header.classList.toggle("site-header--open", isOpen);
    updateLabel();
  }

  /**
   * Collapses or expands the header.
   *
   * Closing the menu on collapse keeps the two in step: a menu left open while
   * the header expands would show the links twice.
   *
   * @param {boolean} next
   */
  function setCollapsed(next) {
    if (next === isCollapsed) {
      return;
    }

    isCollapsed = next;
    header.classList.toggle("site-header--collapsed", isCollapsed);

    if (!isCollapsed) {
      setOpen(false);
    }
  }

  /** Applies the rules for the current width and scroll position. */
  function update() {
    if (wide.matches) {
      // On a wide screen the header never collapses and the button is taken out
      // of the document, so it cannot be reached by keyboard or read out.
      toggle.hidden = true;
      setCollapsed(false);
      setOpen(false);
      return;
    }

    toggle.hidden = false;
    setCollapsed(window.scrollY > COLLAPSE_AFTER);
  }

  // passive: the listener never calls preventDefault, and saying so lets the
  // browser keep scrolling smoothly instead of waiting for it.
  window.addEventListener("scroll", update, { passive: true });
  wide.addEventListener("change", update);

  toggle.addEventListener("click", () => setOpen(!isOpen));

  // Following a link inside the menu means the user is done with it.
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a, [data-sign-out]")) {
      setOpen(false);
    }
  });

  // Escape closes the menu, which is what a keyboard user expects of anything
  // that opens over the page.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) {
      setOpen(false);
      toggle.focus();
    }
  });

  update();
  updateLabel();

  return {
    /** Rewrites the button's label after a language change. */
    refreshLabels: updateLabel,

    /** Closes the menu, used when the view changes underneath it. */
    close() {
      setOpen(false);
    },
  };
}
