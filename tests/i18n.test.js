/**
 * Tests for the translations.
 *
 * The most useful thing to test here is not that one string is right, but that
 * the two languages hold exactly the same keys. A key present in English and
 * missing in Norwegian shows up as English text in a Norwegian interface, which
 * is easy to miss by eye and caught immediately here.
 *
 * Run with: npm test
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getLanguage, setLanguage, t } from "../src/js/i18n/i18n.js";
import { DEFAULT_LANGUAGE, translations } from "../src/js/i18n/translations.js";

describe("translations", () => {
  it("has both languages", () => {
    assert.ok(translations.en, "English is missing");
    assert.ok(translations.nb, "Norwegian is missing");
  });

  it("uses a language that exists as the default", () => {
    assert.ok(DEFAULT_LANGUAGE in translations);
  });

  it("has the same keys in every language", () => {
    const englishKeys = Object.keys(translations.en).sort();

    Object.entries(translations).forEach(([language, strings]) => {
      const keys = Object.keys(strings).sort();

      const missing = englishKeys.filter((key) => !keys.includes(key));
      const extra = keys.filter((key) => !englishKeys.includes(key));

      assert.deepEqual(missing, [], `${language} is missing: ${missing.join(", ")}`);
      assert.deepEqual(extra, [], `${language} has keys English does not: ${extra.join(", ")}`);
    });
  });

  it("has no empty strings", () => {
    Object.entries(translations).forEach(([language, strings]) => {
      Object.entries(strings).forEach(([key, value]) => {
        assert.ok(value.trim().length > 0, `${language}.${key} is empty`);
      });
    });
  });

  it("uses the same placeholders in every language", () => {
    const placeholdersIn = (text) => (text.match(/\{(\w+)\}/g) ?? []).sort();

    Object.keys(translations.en).forEach((key) => {
      const expected = placeholdersIn(translations.en[key]);

      Object.entries(translations).forEach(([language, strings]) => {
        assert.deepEqual(
          placeholdersIn(strings[key]),
          expected,
          `${language}.${key} does not use the same placeholders as English`,
        );
      });
    });
  });

  it("translates all fourteen recipe categories", () => {
    // The category list TheMealDB serves. Filtering matches on these English
    // names, so a missing translation would leave an English label behind.
    const categories = [
      "Beef",
      "Breakfast",
      "Chicken",
      "Dessert",
      "Goat",
      "Lamb",
      "Miscellaneous",
      "Pasta",
      "Pork",
      "Seafood",
      "Side",
      "Starter",
      "Vegan",
      "Vegetarian",
    ];

    categories.forEach((category) => {
      Object.entries(translations).forEach(([language, strings]) => {
        assert.ok(
          `category.${category}` in strings,
          `${language} is missing category.${category}`,
        );
      });
    });
  });
});

describe("t", () => {
  it("returns the string for the active language", () => {
    setLanguage("en");
    assert.equal(t("auth.signIn"), "Sign in");

    setLanguage("nb");
    assert.equal(t("auth.signIn"), "Logg inn");

    setLanguage("en");
  });

  it("fills in placeholders", () => {
    setLanguage("en");
    assert.equal(t("recipe.saveLabel", { name: "Paella" }), "Save Paella to your recipes");
  });

  it("fills in a placeholder used more than once", () => {
    assert.equal(t("browse.countMany", { count: 25 }), "25 recipes");
  });

  it("leaves an unknown placeholder in place rather than writing undefined", () => {
    const result = t("recipe.saveLabel", { wrongName: "Paella" });

    assert.match(result, /\{name\}/);
    assert.doesNotMatch(result, /undefined/);
  });

  it("returns the key itself when nothing matches, so gaps are visible", () => {
    assert.equal(t("this.key.does.not.exist"), "this.key.does.not.exist");
  });

  it("ignores an unknown language rather than switching to it", () => {
    setLanguage("en");
    setLanguage("kl");

    assert.equal(getLanguage(), "en");
  });
});
