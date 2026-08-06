/**
 * The dinner wheel: a spinning wheel that picks one recipe at random.
 *
 * The wheel is drawn as an SVG so the segments stay crisp at any size and each
 * one can carry its own colour. The spin itself is a single CSS rotation on the
 * wheel group, which lets the browser animate it on the compositor rather than
 * in JavaScript.
 *
 * The result is announced in a live region as well as shown, so the outcome
 * reaches a screen reader instead of being conveyed by the animation alone.
 */

import { t } from "../i18n/i18n.js";
import { createElement } from "../utils/dom.js";

/** How many recipes go on the wheel. Enough to feel varied, few enough to read. */
const SEGMENT_COUNT = 8;

/** How long the wheel spins, in milliseconds. Matches the CSS transition. */
const SPIN_DURATION = 4000;

/** Full turns before landing, so the wheel always looks like it spun properly. */
const FULL_TURNS = 5;

/** The segment colours, repeated around the wheel. */
const SEGMENT_COLOURS = [
  "#2727e6",
  "#ffda00",
  "#ff4141",
  "#91d8ec",
  "#16ab59",
  "#ffbac4",
  "#ff7715",
  "#e1edff",
];

/** The two colours a segment label can be drawn in. */
const LABEL_DARK = "#111118";
const LABEL_LIGHT = "#ffffff";

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
 * The contrast ratio between two colours, from 1:1 to 21:1.
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
 * Text that reads clearly on a given segment colour.
 *
 * The choice is calculated rather than listed, so adding a colour to
 * SEGMENT_COLOURS cannot leave a label below the WCAG AA minimum of 4.5:1 by
 * accident. Only the blue is above the line with white text; every other colour
 * in the set reads better with dark text.
 *
 * @param {string} colour
 * @returns {string}
 */
function labelColourFor(colour) {
  return contrastRatio(LABEL_LIGHT, colour) > contrastRatio(LABEL_DARK, colour)
    ? LABEL_LIGHT
    : LABEL_DARK;
}

/**
 * Builds the `d` attribute for one wedge of a circle.
 *
 * The wedge is drawn from the centre, out along the starting angle, round the
 * rim to the ending angle, and back to the centre.
 *
 * @param {number} startAngle Degrees, clockwise from twelve o'clock.
 * @param {number} endAngle Degrees, clockwise from twelve o'clock.
 * @param {number} radius
 * @returns {string}
 */
function describeWedge(startAngle, endAngle, radius) {
  // SVG angles run from the positive x-axis, so ninety degrees are subtracted to
  // put zero at the top of the circle.
  const toPoint = (angle) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      x: radius + radius * Math.cos(radians),
      y: radius + radius * Math.sin(radians),
    };
  };

  const start = toPoint(startAngle);
  const end = toPoint(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${radius} ${radius}`,
    `L ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

/**
 * Shortens a name that would otherwise overflow its segment.
 * @param {string} name
 * @returns {string}
 */
function shortenName(name) {
  return name.length > 14 ? `${name.slice(0, 13)}…` : name;
}

/**
 * Creates the dinner wheel.
 *
 * @param {object} options
 * @param {HTMLElement} options.container Element the wheel is drawn into.
 * @param {HTMLElement} options.statusElement Live region for the result.
 * @param {HTMLButtonElement} options.spinButton
 * @param {(recipeId: string) => void} options.onPick Called with the winner.
 * @returns {{setRecipes: (recipes: object[]) => void}}
 */
export function createDinnerWheel({ container, statusElement, spinButton, onPick }) {
  const RADIUS = 100;

  /** @type {object[]} The recipes currently on the wheel. */
  let segments = [];

  /** Rotation is kept across spins so the wheel never jumps back to the start. */
  let currentRotation = 0;

  let isSpinning = false;

  const wheelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  wheelGroup.setAttribute("class", "dinner-wheel__group");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${RADIUS * 2} ${RADIUS * 2}`);
  svg.setAttribute("class", "dinner-wheel__svg");
  // The wheel is decorative: the recipe names are already in the grid, and the
  // result is announced in the live region below it.
  svg.setAttribute("aria-hidden", "true");
  svg.append(wheelGroup);

  container.append(svg);

  /** Draws the segments for the current recipes. */
  function draw() {
    wheelGroup.replaceChildren();

    if (segments.length === 0) {
      return;
    }

    const sweep = 360 / segments.length;

    segments.forEach((recipe, index) => {
      const start = index * sweep;
      const colour = SEGMENT_COLOURS[index % SEGMENT_COLOURS.length];

      const wedge = document.createElementNS("http://www.w3.org/2000/svg", "path");
      wedge.setAttribute("d", describeWedge(start, start + sweep, RADIUS));
      wedge.setAttribute("fill", colour);
      wedge.setAttribute("stroke", "#111118");
      wedge.setAttribute("stroke-width", "2");

      // The label is written along its segment, reading outwards from the hub.
      // Rotating by the segment's own angle alone would leave the labels on the
      // bottom half upside down, so those are flipped and anchored from the
      // other end to keep every name the right way up.
      const middle = start + sweep / 2;
      const isUpsideDown = middle > 90 && middle < 270;
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", String(isUpsideDown ? RADIUS * 0.28 : RADIUS * 1.72));
      label.setAttribute("y", String(RADIUS));
      label.setAttribute("text-anchor", isUpsideDown ? "start" : "end");
      label.setAttribute("dominant-baseline", "middle");
      label.setAttribute("font-size", "9");
      label.setAttribute("font-weight", "700");
      label.setAttribute("fill", labelColourFor(colour));
      label.setAttribute(
        "transform",
        `rotate(${middle - 90 + (isUpsideDown ? 180 : 0)} ${RADIUS} ${RADIUS})`,
      );
      label.textContent = shortenName(recipe.name);

      wheelGroup.append(wedge, label);
    });
  }

  /**
   * Spins the wheel and reports the recipe it lands on.
   *
   * The winner is chosen first and the rotation is then calculated to land on
   * it, which is simpler and more reliable than measuring where a random spin
   * happened to stop.
   */
  function spin() {
    if (isSpinning || segments.length === 0) {
      return;
    }

    isSpinning = true;
    spinButton.disabled = true;
    container.classList.remove("dinner-wheel--celebrating");
    statusElement.textContent = t("wheel.spinning");

    const winningIndex = Math.floor(Math.random() * segments.length);
    const winner = segments[winningIndex];
    const sweep = 360 / segments.length;

    // The pointer sits at the top, so the middle of the winning segment has to
    // finish there: a full circle minus its own position.
    const targetAngle = 360 - (winningIndex * sweep + sweep / 2);

    // Rotating onwards from the current angle keeps the movement continuous, and
    // the extra full turns give it momentum.
    currentRotation += FULL_TURNS * 360 + ((targetAngle - (currentRotation % 360)) + 360) % 360;
    wheelGroup.style.transform = `rotate(${currentRotation}deg)`;

    window.setTimeout(() => {
      isSpinning = false;
      spinButton.disabled = false;
      container.classList.add("dinner-wheel--celebrating");
      statusElement.textContent = t("wheel.result", { name: winner.name });
      onPick(winner.id);
    }, SPIN_DURATION);
  }

  spinButton.addEventListener("click", spin);

  return {
    /**
     * Puts a fresh set of recipes on the wheel.
     *
     * A random sample is taken so the wheel is not always the first eight
     * results, which would make it feel fixed.
     *
     * @param {object[]} recipes
     */
    setRecipes(recipes) {
      segments = [...recipes].sort(() => Math.random() - 0.5).slice(0, SEGMENT_COUNT);

      draw();

      const hasRecipes = segments.length > 0;
      spinButton.disabled = !hasRecipes || isSpinning;
      statusElement.textContent = hasRecipes
        ? t("wheel.idle")
        : t("wheel.empty");
    },
  };
}
