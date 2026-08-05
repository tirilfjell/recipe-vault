/**
 * Data access layer for TheMealDB.
 *
 * The module returns recipes in the shape the rest of the application uses, so
 * no other file has to know that the API names its fields `strMeal`,
 * `strIngredient1` and so on. If the API were ever swapped out, this file would
 * be the only one that changed.
 *
 * Documentation: https://www.themealdb.com/api.php
 */

import { t } from "../i18n/i18n.js";
import { ApiError } from "./ApiError.js";

/** The documented free endpoint. "1" is the public test key. */
const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

/** Requests are given up on after this many milliseconds. */
const REQUEST_TIMEOUT_MS = 12000;

/** TheMealDB stores up to this many ingredient and measure pairs per recipe. */
const MAX_INGREDIENTS = 20;

/**
 * Sends one request and returns the parsed body.
 * @param {string} endpoint Path and query, for example "search.php?s=pasta".
 * @returns {Promise<object>}
 * @throws {ApiError} On a network problem, a timeout or a non-OK status.
 */
async function request(endpoint) {
  try {
    // Data is fetched over HTTPS only, and a request that never resolves is
    // aborted rather than leaving the user on a loading message.
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new ApiError(
        `The recipe service answered with status ${response.status}. Please try again shortly.`,
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error?.name === "TimeoutError") {
      throw new ApiError(t("apiError.timeout"), error);
    }

    throw new ApiError(
      t("apiError.loadFailedOffline"),
      error,
    );
  }
}

/**
 * Collects the ingredient and measure pairs that are actually filled in.
 * @param {object} raw A recipe as returned by the API.
 * @returns {{name: string, measure: string}[]}
 */
function readIngredients(raw) {
  const ingredients = [];

  for (let index = 1; index <= MAX_INGREDIENTS; index += 1) {
    const name = raw[`strIngredient${index}`]?.trim();
    const measure = raw[`strMeasure${index}`]?.trim();

    // The API pads the unused slots with empty strings and sometimes null.
    if (name) {
      ingredients.push({ name, measure: measure || t("recipe.toTaste") });
    }
  }

  return ingredients;
}

/**
 * Converts one API record into the shape used across the application.
 * @param {object} raw
 * @returns {object}
 */
function normaliseRecipe(raw) {
  return {
    id: raw.idMeal,
    name: raw.strMeal,
    category: raw.strCategory ?? t("recipe.uncategorised"),
    area: raw.strArea ?? t("recipe.unknown"),
    thumbnail: raw.strMealThumb ?? "",
    instructions: raw.strInstructions?.trim() ?? "",
    youtubeUrl: raw.strYoutube || "",
    tags: raw.strTags ? raw.strTags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
    ingredients: readIngredients(raw),
  };
}

/**
 * Searches recipes by name. An empty search term returns the default selection
 * the API offers, which is what the app shows on first load.
 * @param {string} [searchTerm]
 * @returns {Promise<object[]>}
 */
export async function searchRecipes(searchTerm = "") {
  const data = await request(`search.php?s=${encodeURIComponent(searchTerm.trim())}`);

  // TheMealDB answers with `meals: null` rather than an empty array when
  // nothing matches, so that case is turned into an empty list here.
  if (!Array.isArray(data.meals)) {
    return [];
  }

  return data.meals.map(normaliseRecipe);
}

/**
 * Loads one recipe by its id.
 * @param {string} recipeId
 * @returns {Promise<object|null>} Null when the id does not exist.
 */
export async function fetchRecipeById(recipeId) {
  const data = await request(`lookup.php?i=${encodeURIComponent(recipeId)}`);

  if (!Array.isArray(data.meals) || data.meals.length === 0) {
    return null;
  }

  return normaliseRecipe(data.meals[0]);
}

/**
 * Loads the category names used to build the filter.
 * @returns {Promise<string[]>} Sorted category names.
 */
export async function fetchCategories() {
  const data = await request("categories.php");

  if (!Array.isArray(data.categories)) {
    return [];
  }

  return data.categories
    .map((category) => category.strCategory)
    .filter(Boolean)
    .sort((first, second) => first.localeCompare(second, "en"));
}
