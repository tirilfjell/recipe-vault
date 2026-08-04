/**
 * The sign-in panel.
 *
 * The same form is used for signing in and for creating an account. The chosen
 * mode decides the label on the button and how strictly the password is checked,
 * which keeps the user on one screen instead of moving between two.
 */

import { validateCredentials } from "../utils/validators.js";

/**
 * @param {{form: HTMLFormElement, onSubmit: (values: {mode: string, email: string, password: string}) => Promise<void>}} options
 */
export function createAuthPanel({ form, onSubmit }) {
  /** @type {"sign-in"|"register"} */
  let mode = "sign-in";

  const submitButton = form.querySelector("[data-auth-submit]");
  const modeButtons = [...form.querySelectorAll("[data-auth-mode]")];
  const hint = form.querySelector("[data-auth-hint]");

  /**
   * Shows a message under one field.
   * @param {string} fieldName
   * @param {string} message
   */
  function showFieldError(fieldName, message) {
    form.elements[fieldName]?.setAttribute("aria-invalid", "true");

    const errorElement = form.querySelector(`[data-error-for="${fieldName}"]`);

    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  /** Removes every message in the form. */
  function clearErrors() {
    form.querySelectorAll("[data-error-for]").forEach((element) => {
      element.textContent = "";
    });

    form.querySelectorAll("[aria-invalid]").forEach((element) => {
      element.removeAttribute("aria-invalid");
    });
  }

  /**
   * Switches between signing in and creating an account.
   * @param {"sign-in"|"register"} nextMode
   */
  function setMode(nextMode) {
    mode = nextMode;
    clearErrors();

    modeButtons.forEach((button) => {
      const isActive = button.dataset.authMode === nextMode;
      button.classList.toggle("mode-switch__button--active", isActive);
      // aria-pressed tells a screen reader which of the two is selected.
      button.setAttribute("aria-pressed", String(isActive));
    });

    submitButton.textContent = nextMode === "register" ? "Create account" : "Sign in";
    hint.textContent =
      nextMode === "register"
        ? "Choose a password of at least 6 characters. Your saved recipes are private to your account."
        : "Sign in to browse recipes and to see the ones you have saved.";
  }

  /**
   * Disables the form while a request is running, so it cannot be submitted twice.
   * @param {boolean} isBusy
   */
  function setBusy(isBusy) {
    submitButton.disabled = isBusy;
    submitButton.setAttribute("aria-busy", String(isBusy));
  }

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.authMode));
  });

  // Clear the message for a field as soon as it is edited.
  form.addEventListener("input", (event) => {
    const { name } = event.target;
    form.elements[name]?.removeAttribute("aria-invalid");

    const errorElement = form.querySelector(`[data-error-for="${name}"]`);

    if (errorElement) {
      errorElement.textContent = "";
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();

    const values = {
      email: form.elements.email.value.trim(),
      password: form.elements.password.value,
    };

    const errors = validateCredentials(values, mode);

    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, message]) => showFieldError(field, message));
      form.elements[Object.keys(errors)[0]]?.focus();
      return;
    }

    setBusy(true);

    try {
      await onSubmit({ mode, ...values });
    } finally {
      // Runs whether the sign-in succeeded or failed, so the button is never
      // left disabled.
      setBusy(false);
    }
  });

  setMode("sign-in");

  return {
    /** Empties the form, used after signing out. */
    reset() {
      form.reset();
      clearErrors();
      setMode("sign-in");
    },
  };
}
