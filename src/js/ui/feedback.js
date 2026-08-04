/**
 * The message area that confirms an action or reports a problem.
 *
 * The element carries role="status" and aria-live="polite" in the markup, so a
 * screen reader announces the message without the user having to look for it.
 */

/**
 * @param {HTMLElement} element
 */
export function createFeedback(element) {
  let hideTimeoutId = 0;

  /**
   * @param {string} text
   * @param {"success"|"error"} variant
   */
  function show(text, variant) {
    window.clearTimeout(hideTimeoutId);

    element.classList.remove("feedback--success", "feedback--error");
    element.classList.add(`feedback--${variant}`);
    element.textContent = text;
    element.hidden = false;
  }

  return {
    /**
     * Shows a confirmation, which disappears again on its own.
     * @param {string} text
     */
    showSuccess(text) {
      show(text, "success");
      hideTimeoutId = window.setTimeout(() => this.hide(), 6000);
    },

    /**
     * Shows a problem. Errors stay until the next action.
     * @param {string} text
     */
    showError(text) {
      show(text, "error");
    },

    /** Empties and hides the message area. */
    hide() {
      window.clearTimeout(hideTimeoutId);
      element.textContent = "";
      element.hidden = true;
      element.classList.remove("feedback--success", "feedback--error");
    },
  };
}
