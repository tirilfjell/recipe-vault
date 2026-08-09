/**
 * Translation lookup and the current language.
 *
 * `t(key)` returns the string for the active language. Modules call it every
 * time they build something rather than storing the result, so a change of
 * language only has to re-render the interface.
 *
 * The choice is kept in localStorage so it survives a reload, and anything that
 * needs to redraw subscribes with onLanguageChange.
 */

import { DEFAULT_LANGUAGE, translations } from "./translations.js";

const STORAGE_KEY = "recipe-vault.language";

/** @type {Set<() => void>} Callbacks to run after the language changes. */
const listeners = new Set();

/**
 * The stored value meaning "follow the browser" rather than a fixed language.
 * It is stored explicitly, so that somebody who picked a language can go back to
 * following the browser again.
 */
export const LANGUAGE_AUTO = "auto";

/**
 * The language the browser asks for, or English when it asks for one the app
 * does not have.
 * @returns {string}
 */
function browserLanguage() {
  // navigator.language looks like "nb-NO", so only the part before the dash is
  // compared. It is absent outside a browser, such as when the tests run.
  const preferred =
    typeof navigator === "undefined" ? "" : (navigator.language || "").split("-")[0];

  return preferred in translations ? preferred : DEFAULT_LANGUAGE;
}

/**
 * The stored choice: "auto" or a language code. This is what the settings screen
 * marks as active, and is not necessarily the language on screen.
 * @returns {string}
 */
export function getLanguageChoice() {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);

    if (stored === LANGUAGE_AUTO || (stored && stored in translations)) {
      return stored;
    }
  } catch {
    // Private browsing modes can refuse localStorage. The default is fine.
  }

  return LANGUAGE_AUTO;
}

/** Resolves the stored choice to an actual language code. */
function readInitialLanguage() {
  const choice = getLanguageChoice();

  return choice === LANGUAGE_AUTO ? browserLanguage() : choice;
}

let currentLanguage = readInitialLanguage();

/**
 * The active language code.
 * @returns {string}
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * The language codes the app can show.
 * @returns {string[]}
 */
export function getAvailableLanguages() {
  return Object.keys(translations);
}

/**
 * Looks up one string and fills in any {placeholders}.
 *
 * A missing key falls back to English, and then to the key itself, so a gap in
 * a translation shows up in the interface instead of rendering "undefined".
 *
 * @param {string} key
 * @param {Record<string, string|number>} [values]
 * @returns {string}
 */
export function t(key, values) {
  const template =
    translations[currentLanguage]?.[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;

  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in values ? String(values[name]) : match,
  );
}

/**
 * Switches language, stores the choice and tells every listener to redraw.
 * @param {string} language
 */
export function setLanguage(language) {
  const isAuto = language === LANGUAGE_AUTO;

  if (!isAuto && !(language in translations)) {
    return;
  }

  const resolved = isAuto ? browserLanguage() : language;

  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, language);
  } catch {
    // Not being able to remember the choice is not worth interrupting the user.
  }

  // The listeners still run when only the choice changed, so the settings screen
  // can redraw which option is marked as active.
  currentLanguage = resolved;

  // Screen readers and search engines both use this attribute, so it has to
  // follow the interface language. The guard is there because the translations
  // are also used by the tests, which run without a document.
  if (typeof document !== "undefined") {
    document.documentElement.lang = resolved;
  }

  listeners.forEach((listener) => listener());
}

/**
 * Registers a callback to run whenever the language changes.
 * @param {() => void} listener
 */
export function onLanguageChange(listener) {
  listeners.add(listener);
}

/** Puts the starting language on the document element. */
export function applyInitialLanguage() {
  if (typeof document !== "undefined") {
    document.documentElement.lang = currentLanguage;
  }
}
