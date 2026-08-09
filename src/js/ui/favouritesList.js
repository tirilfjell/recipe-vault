/**
 * The list of saved recipes.
 *
 * An entry is the same card as in the recipe browser, with its photograph and a
 * button that opens the full recipe, and adds a note that can be edited and a
 * button that removes it. The note is a small form of its own, so it is validated
 * in the same way as the sign-in form before it is written to the database.
 *
 * Everything shown here comes from the fields stored alongside the recipe in
 * Firestore, so an entry can be drawn without asking the API for it again.
 */

import { MAX_NOTE_LENGTH, validateNote } from "../utils/validators.js";
import { categoryName } from "../i18n/categoryName.js";
import { t } from "../i18n/i18n.js";
import { createElement } from "../utils/dom.js";
import placeholderImage from "../../assets/img/recipe-placeholder.svg";

/**
 * @param {{
 *   listElement: HTMLElement,
 *   statusElement: HTMLElement,
 *   countElement: HTMLElement,
 *   onSaveNote: (recipeId: string, note: string) => void,
 *   onRemove: (recipeId: string, name: string) => void,
 *   onOpenRecipe: (recipeId: string) => void
 * }} options
 */
export function createFavouritesList({
  listElement,
  statusElement,
  countElement,
  onSaveNote,
  onRemove,
  onOpenRecipe,
}) {
  /**
   * Builds one entry.
   * @param {object} favourite
   * @returns {HTMLLIElement}
   */
  function createItem(favourite) {
    const noteFieldId = `note-${favourite.id}`;
    const noteErrorId = `note-error-${favourite.id}`;

    const noteInput = createElement("input", {
      className: "favourite__note-input",
      attributes: {
        type: "text",
        id: noteFieldId,
        name: "note",
        value: favourite.note ?? "",
        maxlength: String(MAX_NOTE_LENGTH),
        placeholder: t("saved.notePlaceholder"),
        "aria-describedby": noteErrorId,
      },
    });

    const noteError = createElement("span", {
      className: "favourite__note-error",
      attributes: { id: noteErrorId },
    });

    const noteForm = createElement("form", {
      className: "favourite__note-form",
      attributes: { novalidate: "" },
      children: [
        createElement("label", {
          className: "favourite__note-label",
          text: "Note",
          attributes: { for: noteFieldId },
        }),
        createElement("div", {
          className: "favourite__note-row",
          children: [
            noteInput,
            createElement("button", {
              className: "button button--secondary button--small",
              text: t("saved.saveNote"),
              attributes: { type: "submit" },
            }),
          ],
        }),
        noteError,
      ],
    });

    noteForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const note = noteInput.value.trim();
      const message = validateNote(note);

      noteError.textContent = message;
      noteInput.toggleAttribute("aria-invalid", Boolean(message));

      if (!message) {
        onSaveNote(favourite.id, note);
      }
    });

    noteInput.addEventListener("input", () => {
      noteError.textContent = "";
      noteInput.removeAttribute("aria-invalid");
    });

    const removeButton = createElement("button", {
      className: "button button--danger",
      text: t("saved.remove"),
      attributes: {
        type: "button",
        "aria-label": t("recipe.removeLabel", { name: favourite.name }),
      },
    });

    removeButton.addEventListener("click", () => onRemove(favourite.id, favourite.name));

    const image = createElement("img", {
      className: "recipe-card__image",
      attributes: {
        // The thumbnail was stored with the recipe, so the card can be drawn
        // without asking the API for it again.
        src: favourite.thumbnail || placeholderImage,
        alt: t("recipe.photograph", { name: favourite.name }),
        loading: "lazy",
        width: "400",
        height: "300",
      },
    });

    image.addEventListener(
      "error",
      () => {
        image.src = placeholderImage;
        image.alt = t("recipe.noPhotograph", { name: favourite.name });
      },
      { once: true },
    );

    const openButton = createElement("button", {
      className: "button button--secondary",
      text: t("recipe.view"),
      attributes: {
        type: "button",
        "aria-label": t("recipe.viewLabel", { name: favourite.name }),
      },
    });

    openButton.addEventListener("click", () => onOpenRecipe(favourite.id));

    return createElement("li", {
      className: "favourite",
      children: [
        createElement("div", {
          className: "recipe-card__image-frame",
          children: [image],
        }),
        createElement("div", {
          className: "favourite__body",
          children: [
            createElement("h2", { className: "favourite__title", text: favourite.name }),
            createElement("p", {
              className: "favourite__meta",
              children: [
                createElement("span", {
                  className: "badge",
                  text: favourite.category ? categoryName(favourite.category) : t("recipe.uncategorised"),
                }),
                createElement("span", {
                  className: "recipe-card__area",
                  text: favourite.area ?? "",
                }),
              ],
            }),
            noteForm,
            createElement("div", {
              className: "favourite__actions",
              children: [openButton, removeButton],
            }),
          ],
        }),
      ],
    });
  }

  return {
    /**
     * Draws the saved recipes.
     * @param {object[]} favourites
     */
    render(favourites) {
      countElement.textContent = t("saved.count", { count: favourites.length });

      if (favourites.length === 0) {
        statusElement.textContent =
          t("saved.empty");
        statusElement.hidden = false;
        listElement.replaceChildren();
        return;
      }

      statusElement.hidden = true;
      statusElement.textContent = "";

      const fragment = document.createDocumentFragment();
      favourites.forEach((favourite) => fragment.append(createItem(favourite)));
      listElement.replaceChildren(fragment);
    },

    /**
     * Shows an error instead of the list.
     * @param {string} message
     */
    showError(message) {
      statusElement.textContent = message;
      statusElement.hidden = false;
      listElement.replaceChildren();
    },

    /** Empties the list, used when the user signs out. */
    clear() {
      countElement.textContent = t("saved.count", { count: 0 });
      statusElement.hidden = true;
      listElement.replaceChildren();
    },
  };
}
