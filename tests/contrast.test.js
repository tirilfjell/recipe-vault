/**
 * Contrast tests.
 *
 * The requirement is that text and interactive elements have good contrast
 * against their background. Checking it by eye does not scale and does not stay
 * true, so the ratios are calculated here from the same colour values the
 * stylesheet uses, in both themes.
 *
 * The threshold is the WCAG AA minimum of 4.5:1 for normal text.
 *
 * Run with: npm test
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** The WCAG AA minimum for normal-sized text. */
const AA_NORMAL = 4.5;

/**
 * The relative luminance of a hex colour, as defined by WCAG.
 * @param {string} hex
 * @returns {number}
 */
function relativeLuminance(hex) {
  const channels = [1, 3, 5].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/**
 * The contrast ratio between two colours.
 * @param {string} first
 * @param {string} second
 * @returns {number}
 */
function contrastRatio(first, second) {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);

  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Asserts a pairing meets AA.
 * @param {string} description
 * @param {string} foreground
 * @param {string} background
 */
function assertReadable(description, foreground, background) {
  const ratio = contrastRatio(foreground, background);

  assert.ok(
    ratio >= AA_NORMAL,
    `${description}: ${ratio.toFixed(2)}:1 is below the AA minimum of ${AA_NORMAL}:1`,
  );
}

/* The colour tokens from src/css/base.css. They are repeated here rather than
   parsed out of the stylesheet, so that changing a colour makes a test fail and
   the change has to be a deliberate one. */
const light = {
  background: "#f0f6ff",
  surface: "#ffffff",
  surfaceMuted: "#e1edff",
  text: "#111118",
  textMuted: "#4a4a57",
  primary: "#2727e6",
  primaryContrast: "#ffffff",
  danger: "#c11616",
  dangerSurface: "#ffe4e4",
  success: "#0f6b38",
  successSurface: "#d6f5e3",
  accentYellow: "#ffda00",
};

const dark = {
  background: "#12121a",
  surface: "#1c1c28",
  surfaceMuted: "#262636",
  text: "#f4f4f8",
  textMuted: "#b4b4c4",
  primary: "#8f8fff",
  primaryContrast: "#12121a",
  danger: "#ff8a8a",
  dangerSurface: "#3a1f22",
  success: "#7fe0a8",
  successSurface: "#14301f",
  accentYellow: "#ffda00",
};

/** The wheel's segment colours, from src/js/ui/dinnerWheel.js. */
const segmentColours = [
  "#2727e6",
  "#ffda00",
  "#ff4141",
  "#91d8ec",
  "#16ab59",
  "#ffbac4",
  "#ff7715",
  "#e1edff",
];

[
  ["light", light],
  ["dark", dark],
].forEach(([themeName, theme]) => {
  describe(`contrast in the ${themeName} theme`, () => {
    it("body text is readable on every surface", () => {
      assertReadable("text on background", theme.text, theme.background);
      assertReadable("text on surface", theme.text, theme.surface);
      assertReadable("text on muted surface", theme.text, theme.surfaceMuted);
    });

    it("muted text is readable on every surface", () => {
      assertReadable("muted text on background", theme.textMuted, theme.background);
      assertReadable("muted text on surface", theme.textMuted, theme.surface);
      assertReadable("muted text on muted surface", theme.textMuted, theme.surfaceMuted);
    });

    it("the primary button is readable", () => {
      assertReadable("primary button label", theme.primaryContrast, theme.primary);
    });

    it("primary coloured text is readable as a link", () => {
      assertReadable("primary on surface", theme.primary, theme.surface);
      assertReadable("primary on background", theme.primary, theme.background);
    });

    it("the error and success messages are readable", () => {
      assertReadable("danger on its surface", theme.danger, theme.dangerSurface);
      assertReadable("danger on surface", theme.danger, theme.surface);
      assertReadable("success on its surface", theme.success, theme.successSurface);
    });

    it("the badge is readable", () => {
      assertReadable("badge text on yellow", "#111118", theme.accentYellow);
    });

    it("the yellow hover state keeps dark text in both themes", () => {
      // Save and View recipe turn yellow on hover. Their resting label is the
      // theme's text colour, which in the dark theme is near-white, so the label
      // has to switch to the dark ink at the same time as the background.
      assertReadable("hovered button label on yellow", "#111118", theme.accentYellow);
    });

    it("the yellow pills keep dark text in both themes", () => {
      // The badge, the count pill and the Saved button stay yellow whichever
      // theme is active, so they must not take the theme's text colour: in the
      // dark theme that is #f4f4f8, which is unreadable on yellow. This is what
      // made "3 lagret" invisible on a phone in dark mode.
      const ratio = contrastRatio(theme.text, theme.accentYellow);

      if (themeName === "dark") {
        assert.ok(
          ratio < AA_NORMAL,
          "the dark theme's text colour is expected to fail on yellow, which is why the yellow pills hard-code the dark ink",
        );
      }

      assertReadable("the ink actually used on the yellow pills", "#111118", theme.accentYellow);
    });
  });
});

describe("the dinner wheel labels", () => {
  it("every segment can carry a readable label", () => {
    segmentColours.forEach((colour) => {
      const best = Math.max(
        contrastRatio("#ffffff", colour),
        contrastRatio("#111118", colour),
      );

      assert.ok(
        best >= AA_NORMAL,
        `no readable label colour for segment ${colour}: best is ${best.toFixed(2)}:1`,
      );
    });
  });

  it("picks the more readable of the two label colours", () => {
    // Mirrors labelColourFor in dinnerWheel.js. White is only the better choice
    // on the blue; every other colour in the set needs dark text.
    segmentColours.forEach((colour) => {
      const chosen =
        contrastRatio("#ffffff", colour) > contrastRatio("#111118", colour)
          ? "#ffffff"
          : "#111118";

      assertReadable(`label on segment ${colour}`, chosen, colour);
    });
  });
});
