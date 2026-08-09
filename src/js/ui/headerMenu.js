/**
 * The header menu button and the panel it opens.
 *
 * The header is two pills in opposite corners: the brand on the left, and on the
 * right either the navigation links or, below the breakpoint, a menu button. The
 * links never wrap onto a second row; below the width where they fit beside the
 * brand, they move into the panel instead.
 *
 * The button is only present when there is something to open. Both the
 * navigation and the account controls are hidden until somebody is signed in, so
 * on the sign-in screen the button would otherwise open an empty panel.
 */

import { t } from "../i18n/i18n.js";

/** The width from which the links fit beside the brand and the button goes away. */
const WIDE_FROM = "(min-width: 48rem)";

/** How long the panel takes to open, matching the CSS transition. */
const PANEL_DURATION = 300;

/**
 * Creates the header menu.
 *
 * @param {object} options
 * @param {HTMLElement} options.header The site header.
 * @param {HTMLButtonElement} options.toggle The menu button.
 * @param {HTMLElement} options.menu The panel the button opens.
 * @param {HTMLElement} options.nav The inline navigation, hidden while narrow.
 * @returns {{refreshLabels: () => void, close: () => void, setHasContent: (has: boolean) => void}}
 */
export function createHeaderMenu({ header, toggle, menu, nav }) {
  const wide = window.matchMedia(WIDE_FROM);

  let isOpen = false;

  /** Whether there is anything in the menu to show. */
  let hasContent = false;

  /** Writes the button's label for its current state. */
  function updateLabel() {
    toggle.setAttribute("aria-label", t(isOpen ? "app.closeMenu" : "app.openMenu"));
  }

  /**
   * Opens or closes the panel.
   *
   * The panel keeps the hidden attribute while it is closed, so its links are
   * neither reachable by keyboard nor read out. It is revealed one step before
   * the class arrives, because an element that is display:none cannot animate.
   *
   * @param {boolean} next
   */
  function setOpen(next) {
    isOpen = next;
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.classList.toggle("menu-toggle--open", isOpen);
    updateLabel();

    if (isOpen) {
      menu.hidden = false;
      // Reading a layout property flushes the change, so the browser sees the
      // element as displayed before the class arrives and animates from the
      // closed state rather than jumping straight to the open one.
      void menu.offsetHeight;
      menu.classList.add("site-menu--open");
      return;
    }

    menu.classList.remove("site-menu--open");

    // Hidden only once the closing animation has finished, so it plays out. The
    // timeout also covers prefers-reduced-motion, where no transition runs and
    // transitionend would never fire.
    window.setTimeout(() => {
      if (!isOpen) {
        menu.hidden = true;
      }
    }, PANEL_DURATION);
  }

  /** Applies the rules for the current width and contents. */
  function update() {
    // Nothing to open, or a wide screen where the links sit inline: the button
    // is taken out of the document, so it cannot be reached or read out.
    if (!hasContent || wide.matches) {
      toggle.hidden = true;

      if (isOpen) {
        setOpen(false);
      }

      return;
    }

    toggle.hidden = false;
  }

  wide.addEventListener("change", update);

  toggle.addEventListener("click", () => setOpen(!isOpen));

  // Following a link or signing out means the user is done with the panel.
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a, [data-sign-out]")) {
      setOpen(false);
    }
  });

  // A click anywhere else closes it, which is what a panel over the page is
  // expected to do.
  document.addEventListener("click", (event) => {
    if (isOpen && !header.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) {
      setOpen(false);
      toggle.focus();
    }
  });

  update();
  updateLabel();

  return {
    /**
     * Tells the header whether the menu has anything in it. The button only
     * appears once there is something to open, and the inline navigation is
     * shown and hidden with it.
     * @param {boolean} has
     */
    setHasContent(has) {
      hasContent = has;
      nav.hidden = !has;
      update();
    },

    /** Rewrites the button's label after a language change. */
    refreshLabels: updateLabel,

    /** Closes the panel. */
    close() {
      setOpen(false);
    },
  };
}
