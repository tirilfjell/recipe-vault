/**
 * Applies translations to the markup that ships in index.html.
 *
 * Static text carries a data attribute naming its translation key, so this one
 * function can translate the whole page and be run again after a language
 * change. Text that modules build themselves calls t() directly instead.
 *
 *   data-i18n              -> the element's text
 *   data-i18n-placeholder  -> its placeholder attribute
 *   data-i18n-aria-label   -> its aria-label attribute
 */

import { t } from "./i18n.js";

/**
 * Translates every marked element inside a root.
 * @param {ParentNode} [root]
 */
export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });

  root.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
}
