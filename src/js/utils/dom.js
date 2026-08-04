/**
 * Small helpers for building elements.
 *
 * Everything on the page is created with these instead of with innerHTML, so
 * text that comes from the API or from another user is always inserted as text
 * and can never be parsed as markup.
 */

/**
 * Creates an element.
 *
 * @param {string} tagName
 * @param {{className?: string, text?: string, attributes?: Record<string, string>, children?: Node[]}} [options]
 * @returns {HTMLElement}
 */
export function createElement(tagName, options = {}) {
  const { className, text, attributes, children } = options;
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  if (attributes) {
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
  }

  if (children) {
    element.append(...children);
  }

  return element;
}

/**
 * Looks up one element and fails loudly when the markup does not match, which
 * makes a renamed id obvious during development instead of at runtime.
 * @param {string} selector
 * @returns {HTMLElement}
 */
export function requireElement(selector) {
  const element = document.querySelector(selector);

  if (!element) {
    throw new Error(`The page is missing the element "${selector}".`);
  }

  return element;
}
