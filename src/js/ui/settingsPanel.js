/**
 * The settings screen: language, appearance and account deletion.
 *
 * The panel builds its own contents so every label can be redrawn when the
 * language changes. It holds no state of its own: the language and theme are
 * read from their services, and deleting the account is reported upwards through
 * a callback.
 */

import {
  LANGUAGE_AUTO,
  getAvailableLanguages,
  getLanguageChoice,
  setLanguage,
  t,
} from "../i18n/i18n.js";
import {
  THEME_DARK,
  THEME_LIGHT,
  THEME_SYSTEM,
  getThemeChoice,
  setTheme,
} from "../features/themeService.js";
import { createElement } from "../utils/dom.js";
import { translations } from "../i18n/translations.js";

/**
 * Creates the settings screen.
 *
 * @param {object} options
 * @param {HTMLElement} options.container Element the settings are drawn into.
 * @param {() => Promise<void>} options.onDeleteAccount Runs the deletion.
 * @returns {{render: () => void}}
 */
export function createSettingsPanel({ container, onDeleteAccount }) {
  /** Whether the type-to-confirm step is showing. */
  let isConfirming = false;

  /** Set while the deletion is running, so the button cannot be pressed twice. */
  let isDeleting = false;

  /**
   * One labelled group of controls.
   * @param {string} headingKey
   * @param {string} hintKey
   * @param {Node[]} controls
   * @returns {HTMLElement}
   */
  function createSection(headingKey, hintKey, controls) {
    return createElement("section", {
      className: "settings__section",
      children: [
        createElement("h3", { className: "settings__heading", text: t(headingKey) }),
        createElement("p", { className: "settings__hint", text: t(hintKey) }),
        createElement("div", { className: "settings__controls", children: controls }),
      ],
    });
  }

  /**
   * A row of buttons where exactly one is active.
   *
   * aria-pressed carries the state, so which option is chosen does not depend on
   * colour alone.
   *
   * @param {{value: string, label: string}[]} options
   * @param {string} activeValue
   * @param {(value: string) => void} onChoose
   * @returns {HTMLElement[]}
   */
  function createChoiceButtons(options, activeValue, onChoose) {
    return options.map((option) => {
      const isActive = option.value === activeValue;

      const button = createElement("button", {
        className: `button ${isActive ? "button--primary" : "button--secondary"}`,
        text: option.label,
        attributes: {
          type: "button",
          "aria-pressed": String(isActive),
        },
      });

      button.addEventListener("click", () => onChoose(option.value));

      return button;
    });
  }

  /** The language section. */
  function createLanguageSection() {
    const options = [
      // Automatic is first and is the default: the app follows the browser until
      // a language is chosen deliberately.
      { value: LANGUAGE_AUTO, label: t("settings.languageAuto") },
      ...getAvailableLanguages().map((code) => ({
        value: code,
        // The name of each language is written in that language, which is what a
        // reader looking for their own language expects to see.
        label: translations[code]["language.name"],
      })),
    ];

    return createSection(
      "settings.languageHeading",
      "settings.languageHint",
      createChoiceButtons(options, getLanguageChoice(), (code) => setLanguage(code)),
    );
  }

  /** The light and dark section. */
  function createThemeSection() {
    const options = [
      // System is first and is the default.
      { value: THEME_SYSTEM, label: t("settings.themeSystem") },
      { value: THEME_LIGHT, label: t("settings.themeLight") },
      { value: THEME_DARK, label: t("settings.themeDark") },
    ];

    return createSection(
      "settings.themeHeading",
      "settings.themeHint",
      createChoiceButtons(options, getThemeChoice(), (theme) => {
        setTheme(theme);
        render();
      }),
    );
  }

  /**
   * The account deletion section.
   *
   * The first press only reveals the confirmation step. Nothing is deleted until
   * the exact word has been typed, which makes an accidental click harmless.
   */
  function createDangerSection() {
    if (!isConfirming) {
      const startButton = createElement("button", {
        className: "button button--danger",
        text: t("settings.deleteButton"),
        attributes: { type: "button" },
      });

      startButton.addEventListener("click", () => {
        isConfirming = true;
        render();
      });

      return createSection("settings.dangerHeading", "settings.dangerHint", [startButton]);
    }

    const confirmWord = t("settings.deleteWord");
    const inputId = "settings-delete-confirm";
    const errorId = "settings-delete-error";

    const error = createElement("p", {
      className: "settings__error",
      attributes: { id: errorId, role: "alert" },
    });

    const input = createElement("input", {
      className: "settings__input",
      attributes: {
        id: inputId,
        type: "text",
        autocomplete: "off",
        "aria-describedby": errorId,
      },
    });

    const label = createElement("label", {
      className: "settings__label",
      text: t("settings.deleteConfirmLabel", { word: confirmWord }),
      attributes: { for: inputId },
    });

    const confirmButton = createElement("button", {
      className: "button button--danger",
      text: t("settings.deleteConfirm"),
      attributes: { type: "button" },
    });

    const cancelButton = createElement("button", {
      className: "button button--secondary",
      text: t("settings.deleteCancel"),
      attributes: { type: "button" },
    });

    confirmButton.addEventListener("click", async () => {
      if (isDeleting) {
        return;
      }

      if (input.value.trim() !== confirmWord) {
        error.textContent = t("settings.deleteMismatch", { word: confirmWord });
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }

      isDeleting = true;
      confirmButton.disabled = true;
      cancelButton.disabled = true;

      try {
        await onDeleteAccount();
      } finally {
        // The panel is rebuilt either way: on success the user is signed out and
        // the settings disappear, and on failure the buttons work again.
        isDeleting = false;
        isConfirming = false;
        render();
      }
    });

    cancelButton.addEventListener("click", () => {
      isConfirming = false;
      render();
    });

    return createSection("settings.dangerHeading", "settings.dangerHint", [
      createElement("div", {
        className: "settings__confirm",
        children: [label, input, error, confirmButton, cancelButton],
      }),
    ]);
  }

  /** Draws the whole panel. */
  function render() {
    container.replaceChildren(
      createLanguageSection(),
      createThemeSection(),
      createDangerSection(),
    );

    // Focus follows the newly revealed field, so a keyboard user is not left
    // hunting for it after pressing Delete.
    if (isConfirming) {
      container.querySelector(".settings__input")?.focus();
    }
  }

  return { render };
}
