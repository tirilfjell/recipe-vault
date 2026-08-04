/**
 * The list of saved recipes.
 *
 * Each entry has a note that can be edited, and a button that removes it. The
 * note is a small form of its own, so it is validated in the same way as the
 * sign-in form before it is written to the database.
 */

import { MAX_NOTE_LENGTH, validateNote } from "../utils/validators.js";
import { createElement } from "../utils/dom.js";

/**
 * @param {{
 *   listElement: HTMLElement,
 *   statusElement: HTMLElement,
 *   countElement: HTMLElement,
 *   onSaveNote: (recipeId: string, note: string) => void,
 *   onRemove: (recipeId: string, name: string) => void
 * }} options
 */
export function createFavouritesList({
  listElement,
  statusElement,
  countElement,
  onSaveNote,
  onRemove,
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
        placeholder: "For example: halve the chilli",
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
              text: "Save note",
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
      className: "button button--danger button--small favourite__remove",
      text: "Remove",
      attributes: {
        type: "button",
        "aria-label": `Remove ${favourite.name} from your saved recipes`,
      },
    });

    removeButton.addEventListener("click", () => onRemove(favourite.id, favourite.name));

    return createElement("li", {
      className: "favourite",
      children: [
        createElement("div", {
          className: "favourite__header",
          children: [
            createElement("h3", { className: "favourite__title", text: favourite.name }),
            createElement("p", {
              className: "favourite__meta",
              children: [
                createElement("span", { className: "badge", text: favourite.category ?? "Recipe" }),
                createElement("span", {
                  className: "recipe-card__area",
                  text: favourite.area ?? "",
                }),
              ],
            }),
          ],
        }),
        noteForm,
        removeButton,
      ],
    });
  }

  return {
    /**
     * Draws the saved recipes.
     * @param {object[]} favourites
     */
    render(favourites) {
      countElement.textContent = String(favourites.length);

      if (favourites.length === 0) {
        statusElement.textContent =
          "You have not saved any recipes yet. Use the Save button on a recipe to keep it here.";
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
      countElement.textContent = "0";
      statusElement.hidden = true;
      listElement.replaceChildren();
    },
  };
}
