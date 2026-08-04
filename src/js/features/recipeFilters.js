/**
 * Filtering and sorting of the recipe list.
 *
 * These are pure functions: they take a list and return a new one, without
 * touching the page or the state. That makes the behaviour easy to follow, and
 * the same helpers work for the search results and for the saved recipes.
 */

/** The sort orders offered in the interface. */
export const SORT_OPTIONS = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "category-asc", label: "Category (A–Z)" },
  { value: "area-asc", label: "Cuisine (A–Z)" },
];

/** Sort order used before the user picks one. */
export const DEFAULT_SORT = "name-asc";

/**
 * Keeps only the recipes in one category.
 * @param {object[]} recipes
 * @param {string} category Empty string means every category.
 * @returns {object[]}
 */
export function filterByCategory(recipes, category) {
  if (!category) {
    return [...recipes];
  }

  return recipes.filter((recipe) => recipe.category === category);
}

/**
 * Sorts recipes in the chosen order.
 * @param {object[]} recipes
 * @param {string} sortOrder One of the values in SORT_OPTIONS.
 * @returns {object[]} A new, sorted list.
 */
export function sortRecipes(recipes, sortOrder) {
  // The list is copied first, because sort() would otherwise reorder the array
  // that is held in state.
  const sorted = [...recipes];
  const byName = (first, second) => first.name.localeCompare(second.name, "en");

  switch (sortOrder) {
    case "name-desc":
      return sorted.sort((first, second) => byName(second, first));

    case "category-asc":
      return sorted.sort(
        (first, second) =>
          first.category.localeCompare(second.category, "en") || byName(first, second),
      );

    case "area-asc":
      return sorted.sort(
        (first, second) => first.area.localeCompare(second.area, "en") || byName(first, second),
      );

    case "name-asc":
    default:
      return sorted.sort(byName);
  }
}

/**
 * Applies the category filter and the sort order in one step.
 * @param {object[]} recipes
 * @param {{category: string, sort: string}} options
 * @returns {object[]}
 */
export function applyFilters(recipes, { category, sort }) {
  return sortRecipes(filterByCategory(recipes, category), sort);
}

/**
 * The categories present in a list of recipes, used to build the filter when the
 * category endpoint cannot be reached.
 * @param {object[]} recipes
 * @returns {string[]}
 */
export function collectCategories(recipes) {
  const categories = new Set(recipes.map((recipe) => recipe.category).filter(Boolean));
  return [...categories].sort((first, second) => first.localeCompare(second, "en"));
}
