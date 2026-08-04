/**
 * The recipe detail view.
 *
 * A native <dialog> is used with showModal(), which gives the accessible
 * behaviour for free: focus is trapped while it is open, Escape closes it, and
 * the rest of the page is hidden from screen readers.
 */

import { createElement } from "../utils/dom.js";

/**
 * @param {{dialog: HTMLDialogElement, closeButton: HTMLButtonElement}} options
 */
export function createRecipeDialog({ dialog, closeButton }) {
  const titleElement = dialog.querySelector("[data-dialog-title]");
  const bodyElement = dialog.querySelector("[data-dialog-body]");

  closeButton.addEventListener("click", () => dialog.close());

  // Clicking the backdrop closes the dialog. The check confirms the click landed
  // on the dialog itself rather than on any of its content.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  /**
   * @param {object} recipe
   * @returns {HTMLElement[]}
   */
  function buildBody(recipe) {
    const sections = [];

    sections.push(
      createElement("p", {
        className: "recipe-detail__meta",
        children: [
          createElement("span", { className: "badge", text: recipe.category }),
          createElement("span", { className: "recipe-card__area", text: recipe.area }),
        ],
      }),
    );

    if (recipe.thumbnail) {
      sections.push(
        createElement("img", {
          className: "recipe-detail__image",
          attributes: {
            src: recipe.thumbnail,
            alt: `Photograph of ${recipe.name}`,
            width: "600",
            height: "400",
          },
        }),
      );
    }

    sections.push(createElement("h3", { className: "recipe-detail__heading", text: "Ingredients" }));

    sections.push(
      createElement("ul", {
        className: "ingredient-list",
        children: recipe.ingredients.map((ingredient) =>
          createElement("li", {
            className: "ingredient-list__item",
            children: [
              createElement("span", {
                className: "ingredient-list__measure",
                text: ingredient.measure,
              }),
              createElement("span", { text: ingredient.name }),
            ],
          }),
        ),
      }),
    );

    sections.push(createElement("h3", { className: "recipe-detail__heading", text: "Method" }));

    // The instructions arrive as one block of text with line breaks, which is
    // split into paragraphs so it can actually be read.
    const paragraphs = recipe.instructions
      .split(/\r?\n+/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    paragraphs.forEach((paragraph) => {
      sections.push(createElement("p", { text: paragraph }));
    });

    if (recipe.youtubeUrl) {
      sections.push(
        createElement("p", {
          children: [
            createElement("a", {
              text: "Watch the recipe on YouTube",
              attributes: { href: recipe.youtubeUrl, rel: "noopener noreferrer", target: "_blank" },
            }),
          ],
        }),
      );
    }

    return sections;
  }

  return {
    /** Opens the dialog with a loading message while the recipe is fetched. */
    showLoading() {
      titleElement.textContent = "Loading recipe…";
      bodyElement.replaceChildren();

      if (!dialog.open) {
        dialog.showModal();
      }
    },

    /**
     * Shows a recipe.
     * @param {object} recipe
     */
    show(recipe) {
      titleElement.textContent = recipe.name;
      bodyElement.replaceChildren(...buildBody(recipe));

      if (!dialog.open) {
        dialog.showModal();
      }
    },

    /**
     * Shows an error inside the dialog.
     * @param {string} message
     */
    showError(message) {
      titleElement.textContent = "The recipe could not be opened";
      bodyElement.replaceChildren(
        createElement("p", { className: "status-message--error", text: message }),
      );

      if (!dialog.open) {
        dialog.showModal();
      }
    },
  };
}
