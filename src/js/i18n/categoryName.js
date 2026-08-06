/**
 * The display name of a recipe category.
 *
 * TheMealDB serves its categories in English, and those same English strings are
 * the values the category filter matches on. Only the label shown to the user is
 * translated, so filtering keeps working in either language.
 *
 * A category with no translation falls back to the name the API gave, which
 * means a new category appearing upstream shows through rather than breaking.
 */

import { t } from "./i18n.js";
import { DEFAULT_LANGUAGE, translations } from "./translations.js";

/**
 * @param {string} category The English category name from the API.
 * @returns {string} The name to display.
 */
export function categoryName(category) {
  if (!category) {
    return "";
  }

  const key = `category.${category}`;

  // t() falls back to the key itself when nothing matches, which would put
  // "category.Foo" on screen, so the English name is used instead.
  return key in translations[DEFAULT_LANGUAGE] ? t(key) : category;
}
