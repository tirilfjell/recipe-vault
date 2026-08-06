/**
 * Tests for the filtering and sorting.
 *
 * These are the pure functions behind the category filter and the sort order, so
 * they can be tested directly with no browser and no interface around them.
 *
 * Run with: npm test
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_SORT,
  SORT_OPTIONS,
  applyFilters,
  collectCategories,
  filterByCategory,
  sortRecipes,
} from "../src/js/features/recipeFilters.js";

/** A small set of recipes covering the cases the sorting has to get right. */
const recipes = [
  { id: "1", name: "Borsch", category: "Beef", area: "Ukrainian" },
  { id: "2", name: "arepa", category: "Side", area: "Colombian" },
  { id: "3", name: "Paella", category: "Seafood", area: "Spanish" },
  { id: "4", name: "Bistek", category: "Beef", area: "Filipino" },
];

describe("filterByCategory", () => {
  it("returns every recipe when no category is given", () => {
    assert.equal(filterByCategory(recipes, "").length, 4);
  });

  it("keeps only the recipes in the chosen category", () => {
    const result = filterByCategory(recipes, "Beef");

    assert.deepEqual(
      result.map((recipe) => recipe.name),
      ["Borsch", "Bistek"],
    );
  });

  it("returns nothing for a category no recipe has", () => {
    assert.deepEqual(filterByCategory(recipes, "Dessert"), []);
  });

  it("does not modify the list it was given", () => {
    const original = [...recipes];
    filterByCategory(recipes, "Beef");

    assert.deepEqual(recipes, original);
  });
});

describe("sortRecipes", () => {
  it("sorts by name A to Z, ignoring case", () => {
    const result = sortRecipes(recipes, "name-asc");

    // "arepa" is lower case and has to come first regardless.
    assert.deepEqual(
      result.map((recipe) => recipe.name),
      ["arepa", "Bistek", "Borsch", "Paella"],
    );
  });

  it("sorts by name Z to A", () => {
    const result = sortRecipes(recipes, "name-desc");

    assert.equal(result[0].name, "Paella");
    assert.equal(result[3].name, "arepa");
  });

  it("sorts by category", () => {
    const result = sortRecipes(recipes, "category-asc");

    assert.equal(result[0].category, "Beef");
    assert.equal(result[3].category, "Side");
  });

  it("sorts by cuisine", () => {
    const result = sortRecipes(recipes, "area-asc");

    assert.equal(result[0].area, "Colombian");
    assert.equal(result[3].area, "Ukrainian");
  });

  it("returns a new list rather than reordering the original", () => {
    const original = recipes.map((recipe) => recipe.name);
    sortRecipes(recipes, "name-asc");

    assert.deepEqual(
      recipes.map((recipe) => recipe.name),
      original,
    );
  });

  it("falls back to sorting by name for an unknown sort value", () => {
    // The switch has a default branch, so an unrecognised value behaves like the
    // default order rather than leaving the list unsorted.
    const result = sortRecipes(recipes, "not-a-sort-order");

    assert.deepEqual(
      result.map((recipe) => recipe.name),
      ["arepa", "Bistek", "Borsch", "Paella"],
    );
  });
});

describe("applyFilters", () => {
  it("filters and then sorts", () => {
    const result = applyFilters(recipes, { category: "Beef", sort: "name-asc" });

    assert.deepEqual(
      result.map((recipe) => recipe.name),
      ["Bistek", "Borsch"],
    );
  });

  it("handles an empty list", () => {
    assert.deepEqual(applyFilters([], { category: "Beef", sort: DEFAULT_SORT }), []);
  });
});

describe("collectCategories", () => {
  it("lists each category once, in order", () => {
    assert.deepEqual(collectCategories(recipes), ["Beef", "Seafood", "Side"]);
  });

  it("returns nothing for an empty list", () => {
    assert.deepEqual(collectCategories([]), []);
  });
});

describe("SORT_OPTIONS", () => {
  it("has a translation key for every option", () => {
    SORT_OPTIONS.forEach((option) => {
      assert.ok(option.labelKey, `${option.value} is missing a labelKey`);
      assert.match(option.labelKey, /^browse\.sort/);
    });
  });

  it("includes the default sort order", () => {
    assert.ok(SORT_OPTIONS.some((option) => option.value === DEFAULT_SORT));
  });
});
