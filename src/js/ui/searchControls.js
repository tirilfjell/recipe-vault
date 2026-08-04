/**
 * The search field, the category filter and the sort order.
 *
 * The controls own no data. They report what the user chose, and the caller
 * decides what to do with it: a new search term means a new request, while a
 * changed filter or sort order only reorders the recipes already loaded.
 */

import { DEFAULT_SORT, SORT_OPTIONS } from "../features/recipeFilters.js";
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
  // The sort orders are rendered from the same list the sorting itself uses, so
  // the two can never drift apart.
  SORT_OPTIONS.forEach((option) => {
    sortSelect.append(createElement("option", { text: option.label, attributes: { value: option.value } }));
  });

  sortSelect.value = DEFAULT_SORT;

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
      const previousValue = categorySelect.value;

      categorySelect.replaceChildren(
        createElement("option", { text: "All categories", attributes: { value: "" } }),
        ...categories.map((category) =>
          createElement("option", { text: category, attributes: { value: category } }),
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
