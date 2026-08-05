/**
 * The grid of recipe cards.
 *
 * The list is told which recipes to show and which of them are already saved.
 * It reports clicks back through callbacks, so it does not need to know anything
 * about the API or about Firestore.
 */

import { t } from "../i18n/i18n.js";
import { createElement } from "../utils/dom.js";
import placeholderImage from "../../assets/img/recipe-placeholder.svg";

/**
 * @param {{
 *   listElement: HTMLElement,
 *   statusElement: HTMLElement,
 *   onOpenRecipe: (recipeId: string) => void,
 *   onToggleFavourite: (recipeId: string, isSaved: boolean) => void
 * }} options
 */
export function createRecipeList({
  listElement,
  statusElement,
  onOpenRecipe,
  onToggleFavourite,
}) {
  // One listener on the grid handles every card, including cards added later.
  listElement.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-open-recipe]");

    if (openButton) {
      onOpenRecipe(openButton.dataset.openRecipe);
      return;
    }

    const favouriteButton = event.target.closest("[data-toggle-favourite]");

    if (favouriteButton) {
      onToggleFavourite(
        favouriteButton.dataset.toggleFavourite,
        favouriteButton.dataset.saved === "true",
      );
    }
  });

  /**
   * Builds one card.
   * @param {object} recipe
   * @param {boolean} isSaved
   * @returns {HTMLLIElement}
   */
  function createCard(recipe, isSaved) {
    const image = createElement("img", {
      className: "recipe-card__image",
      attributes: {
        // The API image is used when it exists, with a local drawing as the
        // fallback so a card is never left with a broken image.
        src: recipe.thumbnail || placeholderImage,
        alt: t("recipe.photograph", { name: recipe.name }),
        loading: "lazy",
        width: "400",
        height: "300",
      },
    });

    image.addEventListener(
      "error",
      () => {
        image.src = placeholderImage;
        image.alt = t("recipe.noPhotograph", { name: recipe.name });
      },
      { once: true },
    );

    const meta = createElement("p", {
      className: "recipe-card__meta",
      children: [
        createElement("span", { className: "badge", text: recipe.category }),
        createElement("span", { className: "recipe-card__area", text: recipe.area }),
      ],
    });

    const openButton = createElement("button", {
      className: "button button--secondary",
      text: t("recipe.view"),
      attributes: {
        type: "button",
        "data-open-recipe": recipe.id,
        "aria-label": t("recipe.viewLabel", { name: recipe.name }),
      },
    });

    const favouriteButton = createElement("button", {
      className: `button button--ghost${isSaved ? " button--ghost-active" : ""}`,
      text: isSaved ? t("recipe.saved") : t("recipe.save"),
      attributes: {
        type: "button",
        "data-toggle-favourite": recipe.id,
        "data-saved": String(isSaved),
        // The state is spelled out, because a colour change alone is not
        // available to a screen reader.
        "aria-label": isSaved
          ? t("recipe.removeLabel", { name: recipe.name })
          : t("recipe.saveLabel", { name: recipe.name }),
      },
    });

    return createElement("li", {
      className: "recipe-grid__item",
      children: [
        createElement("article", {
          className: "recipe-card",
          children: [
            // The frame clips the photograph to the card's rounded corners and
            // is what the hover zoom is contained by.
            createElement("div", {
              className: "recipe-card__image-frame",
              children: [image],
            }),
            createElement("div", {
              className: "recipe-card__body",
              children: [
                createElement("h3", { className: "recipe-card__title", text: recipe.name }),
                meta,
                createElement("div", {
                  className: "recipe-card__actions",
                  children: [openButton, favouriteButton],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  }

  /**
   * @param {string} message
   * @param {boolean} [isError]
   */
  function showStatus(message, isError = false) {
    statusElement.classList.toggle("status-message--error", isError);
    statusElement.textContent = message;
    statusElement.hidden = false;
    listElement.replaceChildren();
  }

  return {
    /**
     * Draws the recipes.
     * @param {object[]} recipes
     * @param {Set<string>} savedIds Ids of the recipes the user has saved.
     */
    render(recipes, savedIds) {
      if (recipes.length === 0) {
        showStatus(t("browse.noMatches"));
        return;
      }

      statusElement.hidden = true;
      statusElement.textContent = "";

      const fragment = document.createDocumentFragment();

      recipes.forEach((recipe, index) => {
        const item = createCard(recipe, savedIds.has(recipe.id));

        // The cards cascade in rather than all appearing at once. The delay is
        // capped so a long result set never leaves the last card waiting, and
        // the animation itself is disabled under prefers-reduced-motion.
        item.classList.add("is-animated");
        item.style.animationDelay = `${Math.min(index, 12) * 40}ms`;

        fragment.append(item);
      });

      listElement.replaceChildren(fragment);
    },

    /** Shows the loading state. */
    showLoading() {
      showStatus(t("browse.loading"));
    },

    /**
     * Shows an error instead of the grid.
     * @param {string} message
     */
    showError(message) {
      showStatus(message, true);
    },
  };
}
