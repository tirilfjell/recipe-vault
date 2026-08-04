/**
 * Recipe Vault - application entry point.
 *
 * This is the only module that knows about all the others. It holds the state,
 * reacts to the sign-in state, and connects the interface to the recipe API and
 * to Firestore. Every other module does one job and reports back through
 * callbacks, which keeps the wiring in one readable place.
 */

import "./css/main.css";

import { ApiError } from "./js/api/ApiError.js";
import { fetchCategories, fetchRecipeById, searchRecipes } from "./js/api/mealApi.js";
import { observeUser, register, signIn, signOutUser } from "./js/auth/authService.js";
import { isFirebaseConfigured } from "./js/auth/firebase.js";
import {
  observeFavourites,
  removeFavourite,
  saveFavourite,
  updateFavouriteNote,
} from "./js/features/favouritesRepository.js";
import { DEFAULT_SORT, applyFilters, collectCategories } from "./js/features/recipeFilters.js";
import { createAuthPanel } from "./js/ui/authPanel.js";
import { createFavouritesList } from "./js/ui/favouritesList.js";
import { createFeedback } from "./js/ui/feedback.js";
import { createRecipeDialog } from "./js/ui/recipeDialog.js";
import { createRecipeList } from "./js/ui/recipeList.js";
import { createSearchControls } from "./js/ui/searchControls.js";
import { requireElement } from "./js/utils/dom.js";

/** Everything the interface needs to know, in one object. */
const state = {
  /** @type {import("firebase/auth").User|null} */
  user: null,
  /** Recipes from the most recent search. */
  recipes: [],
  /** Ids of the recipes the signed-in user has saved. */
  savedIds: new Set(),
  filters: { category: "", sort: DEFAULT_SORT },
};

/** Stops the Firestore listener when the user signs out. */
let unsubscribeFavourites = null;

function main() {
  const elements = {
    authView: requireElement("[data-auth-view]"),
    appView: requireElement("[data-app-view]"),
    authForm: requireElement("[data-auth-form]"),
    setupNotice: requireElement("[data-setup-notice]"),
    accountBar: requireElement("[data-account-bar]"),
    accountEmail: requireElement("[data-account-email]"),
    signOutButton: requireElement("[data-sign-out]"),
    feedback: requireElement("[data-feedback]"),
    searchForm: requireElement("[data-search-form]"),
    categorySelect: requireElement("[data-category-filter]"),
    sortSelect: requireElement("[data-sort-order]"),
    recipeList: requireElement("[data-recipe-list]"),
    recipeStatus: requireElement("[data-recipe-status]"),
    resultSummary: requireElement("[data-result-summary]"),
    favouritesList: requireElement("[data-favourites-list]"),
    favouritesStatus: requireElement("[data-favourites-status]"),
    favouritesCount: requireElement("[data-favourites-count]"),
    dialog: requireElement("[data-recipe-dialog]"),
    dialogClose: requireElement("[data-dialog-close]"),
  };

  const feedback = createFeedback(elements.feedback);

  // Without a Firebase project there is nothing to sign in to. The app says so
  // instead of failing silently, and the form is disabled.
  if (!isFirebaseConfigured()) {
    elements.setupNotice.hidden = false;
    elements.authForm.hidden = true;
    return;
  }

  const recipeList = createRecipeList({
    listElement: elements.recipeList,
    statusElement: elements.recipeStatus,
    onOpenRecipe: (recipeId) => openRecipe(recipeId),
    onToggleFavourite: (recipeId, isSaved) => toggleFavourite(recipeId, isSaved),
  });

  const favouritesList = createFavouritesList({
    listElement: elements.favouritesList,
    statusElement: elements.favouritesStatus,
    countElement: elements.favouritesCount,
    onSaveNote: (recipeId, note) => saveNote(recipeId, note),
    onRemove: (recipeId, name) => removeSavedRecipe(recipeId, name),
  });

  const recipeDialog = createRecipeDialog({
    dialog: elements.dialog,
    closeButton: elements.dialogClose,
  });

  const searchControls = createSearchControls({
    form: elements.searchForm,
    categorySelect: elements.categorySelect,
    sortSelect: elements.sortSelect,
    onSearch: (searchTerm) => loadRecipes(searchTerm),
    onFilterChange: (filters) => {
      state.filters = filters;
      renderRecipes();
    },
  });

  const authPanel = createAuthPanel({
    form: elements.authForm,
    onSubmit: async ({ mode, email, password }) => {
      feedback.hide();

      try {
        // Both calls resolve to a user, and the auth listener below takes it
        // from there, so nothing else has to happen here.
        if (mode === "register") {
          await register(email, password);
          feedback.showSuccess("Your account was created. Welcome!");
        } else {
          await signIn(email, password);
        }
      } catch (error) {
        feedback.showError(error.message);
      }
    },
  });

  /**
   * "1 recipe" but "3 recipes".
   * @param {number} count
   * @returns {string}
   */
  function describeCount(count) {
    return `${count} ${count === 1 ? "recipe" : "recipes"}`;
  }

  /** Draws the recipes with the current filter and sort order. */
  function renderRecipes() {
    const visibleRecipes = applyFilters(state.recipes, state.filters);

    recipeList.render(visibleRecipes, state.savedIds);

    elements.resultSummary.textContent =
      visibleRecipes.length === state.recipes.length
        ? describeCount(visibleRecipes.length)
        : `${visibleRecipes.length} of ${describeCount(state.recipes.length)}`;
  }

  /**
   * Runs a search and shows the result.
   * @param {string} [searchTerm]
   */
  async function loadRecipes(searchTerm = "") {
    recipeList.showLoading();
    searchControls.setBusy(true);
    elements.resultSummary.textContent = "";

    try {
      state.recipes = await searchRecipes(searchTerm);
      renderRecipes();
    } catch (error) {
      console.error("The recipes could not be loaded:", error);
      recipeList.showError(
        error instanceof ApiError
          ? error.message
          : "The recipes could not be loaded. Please try again.",
      );
    } finally {
      searchControls.setBusy(false);
    }
  }

  /** Fills the category filter, falling back to the loaded recipes. */
  async function loadCategories() {
    try {
      searchControls.setCategories(await fetchCategories());
    } catch (error) {
      // A missing filter must not stop the app, so the categories present in
      // the results are used instead.
      console.warn("The category list could not be loaded, using the results instead:", error);
      searchControls.setCategories(collectCategories(state.recipes));
    }
  }

  /**
   * Opens the detail view for one recipe.
   * @param {string} recipeId
   */
  async function openRecipe(recipeId) {
    recipeDialog.showLoading();

    try {
      const recipe = await fetchRecipeById(recipeId);

      if (!recipe) {
        recipeDialog.showError("That recipe could not be found.");
        return;
      }

      recipeDialog.show(recipe);
    } catch (error) {
      console.error("The recipe could not be opened:", error);
      recipeDialog.showError(
        error instanceof ApiError ? error.message : "The recipe could not be opened.",
      );
    }
  }

  /**
   * Saves or removes a recipe.
   * @param {string} recipeId
   * @param {boolean} isSaved Whether it is saved at the moment.
   */
  async function toggleFavourite(recipeId, isSaved) {
    if (!state.user) {
      feedback.showError("Please sign in to save recipes.");
      return;
    }

    const recipe = state.recipes.find((candidate) => candidate.id === recipeId);

    if (!recipe) {
      return;
    }

    try {
      if (isSaved) {
        await removeFavourite(state.user.uid, recipeId);
        feedback.showSuccess(`${recipe.name} was removed from your saved recipes.`);
      } else {
        await saveFavourite(state.user.uid, recipe);
        feedback.showSuccess(`${recipe.name} was saved.`);
      }
      // The card is redrawn by the Firestore listener, which is the single
      // source of truth for what is saved.
    } catch (error) {
      feedback.showError(error.message);
    }
  }

  /**
   * Writes a note on a saved recipe.
   * @param {string} recipeId
   * @param {string} note
   */
  async function saveNote(recipeId, note) {
    if (!state.user) {
      return;
    }

    try {
      await updateFavouriteNote(state.user.uid, recipeId, note);
      feedback.showSuccess("Your note was saved.");
    } catch (error) {
      feedback.showError(error.message);
    }
  }

  /**
   * Removes a saved recipe from the favourites panel.
   * @param {string} recipeId
   * @param {string} name
   */
  async function removeSavedRecipe(recipeId, name) {
    if (!state.user) {
      return;
    }

    try {
      await removeFavourite(state.user.uid, recipeId);
      feedback.showSuccess(`${name} was removed from your saved recipes.`);
    } catch (error) {
      feedback.showError(error.message);
    }
  }

  /**
   * Starts listening to the saved recipes of the signed-in user.
   * @param {string} userId
   */
  function startFavouritesListener(userId) {
    unsubscribeFavourites = observeFavourites(
      userId,
      (favourites) => {
        state.savedIds = new Set(favourites.map((favourite) => favourite.id));
        favouritesList.render(favourites);
        // The Save buttons on the cards follow the saved list.
        renderRecipes();
      },
      (error) => {
        favouritesList.showError(error.message);
      },
    );
  }

  /** Stops the listener and clears everything that belonged to the user. */
  function stopFavouritesListener() {
    unsubscribeFavourites?.();
    unsubscribeFavourites = null;
    state.savedIds = new Set();
    favouritesList.clear();
  }

  elements.signOutButton.addEventListener("click", async () => {
    try {
      await signOutUser();
      feedback.showSuccess("You have been signed out.");
    } catch (error) {
      feedback.showError(error.message);
    }
  });

  // Fires once with the current state and again on every change, so this is the
  // single place that decides which view is shown.
  observeUser((user) => {
    state.user = user;

    if (user) {
      elements.authView.hidden = true;
      elements.appView.hidden = false;
      elements.accountBar.hidden = false;
      elements.accountEmail.textContent = user.email ?? "Signed in";

      startFavouritesListener(user.uid);
      loadRecipes().then(loadCategories);
      return;
    }

    stopFavouritesListener();
    state.recipes = [];

    elements.appView.hidden = true;
    elements.accountBar.hidden = true;
    elements.authView.hidden = false;
    authPanel.reset();
  });
}

try {
  main();
} catch (error) {
  // A failure here means the page could not be started at all, so the message
  // is written straight into the document.
  console.error("The application could not be started:", error);
  document.body.prepend(
    Object.assign(document.createElement("p"), {
      className: "feedback feedback--error",
      textContent: "The application could not be started. Please reload the page.",
    }),
  );
}
