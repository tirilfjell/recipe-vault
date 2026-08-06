/**
 * The search field, the category filter and the sort order.
 *
 * The controls own no data. They report what the user chose, and the caller
 * decides what to do with it: a new search term means a new request, while a
 * changed filter or sort order only reorders the recipes already loaded.
 */

import { DEFAULT_SORT, SORT_OPTIONS } from "../features/recipeFilters.js";
import { categoryName } from "../i18n/categoryName.js";
import { t } from "../i18n/i18n.js";
import { createElement } from "../utils/dom.js";

/**
 * @param {{
 *   form: HTMLFormElement,
 *   categorySelect: HTMLSelectElement,
 *   sortSelect: HTMLSelectElement,
 *   onSearch: (searchTerm: string) => void,
 *   onFilterChange: (state: {category: string, sort: string}) => void
 * }} options
 */
export function createSearchControls({
  form,
  categorySelect,
  sortSelect,
  onSearch,
  onFilterChange,
}) {
  /**
   * Fills the sort order select.
   *
   * The orders are rendered from the same list the sorting itself uses, so the
   * two can never drift apart. The current choice is kept when the list is
   * rebuilt after a language change.
   */
  function renderSortOptions() {
    const previousValue = sortSelect.value || DEFAULT_SORT;

    sortSelect.replaceChildren(
      ...SORT_OPTIONS.map((option) =>
        createElement("option", { text: t(option.labelKey), attributes: { value: option.value } }),
      ),
    );

    sortSelect.value = previousValue;
  }

  renderSortOptions();

  /** The most recent category list, kept so it can be redrawn on a language change. */
  let lastCategories = [];

  /** @returns {{category: string, sort: string}} */
  function readFilters() {
    return { category: categorySelect.value, sort: sortSelect.value };
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onSearch(form.elements.searchTerm.value.trim());
  });

  categorySelect.addEventListener("change", () => onFilterChange(readFilters()));
  sortSelect.addEventListener("change", () => onFilterChange(readFilters()));

  return {
    /**
     * Fills the category filter. Called with the categories from the API, and
     * with the ones found in the results if that request failed.
     * @param {string[]} categories
     */
    setCategories(categories) {
      lastCategories = categories;
      const previousValue = categorySelect.value;

      categorySelect.replaceChildren(
        createElement("option", { text: t("browse.allCategories"), attributes: { value: "" } }),
        // The value stays the English name the recipes carry; only the label is
        // translated.
        ...categories.map((category) =>
          createElement("option", {
            text: categoryName(category),
            attributes: { value: category },
          }),
        ),
      );

      // Keep the current choice if it still exists after the refresh.
      if (categories.includes(previousValue)) {
        categorySelect.value = previousValue;
      }
    },

    /** @returns {{category: string, sort: string}} */
    getFilters: readFilters,

    /**
     * Rebuilds the option labels after a language change. The "All categories"
     * entry is the only category label the app owns; the rest come from the API
     * and are left as they are.
     */
    refreshLabels() {
      renderSortOptions();
      // Rebuilt rather than patched, so the translated category labels follow
      // the language too.
      this.setCategories(lastCategories);
    },

    /**
     * Disables the controls while a request is running.
     * @param {boolean} isBusy
     */
    setBusy(isBusy) {
      form.elements.searchButton.disabled = isBusy;
      categorySelect.disabled = isBusy;
      sortSelect.disabled = isBusy;
    },
  };
}
