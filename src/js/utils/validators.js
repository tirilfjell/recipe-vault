/**
 * Validation rules for the forms.
 *
 * The rules are plain functions over plain values, so they can be read without
 * any interface code around them, and every form reports problems in the same
 * shape: a message per field.
 */

/** Firebase requires at least six characters. */
const MIN_PASSWORD_LENGTH = 6;

/** Longest note accepted on a saved recipe. */
export const MAX_NOTE_LENGTH = 200;

/**
 * A deliberately forgiving email check: something before the @, something after
 * it, and a dot in the domain. Anything stricter rejects valid addresses, and
 * the real check is that the sign-in itself succeeds.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Checks the email and password entered in the sign-in form.
 *
 * @param {{email: string, password: string}} values
 * @param {"sign-in"|"register"} mode The password rules are stricter when an
 *   account is being created, because that is where the password is chosen.
 * @returns {Record<string, string>} A message per invalid field. Empty when valid.
 */
export function validateCredentials({ email, password }, mode) {
  const errors = {};
  const trimmedEmail = email.trim();

  if (trimmedEmail === "") {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Enter a complete email address, for example name@example.com.";
  }

  if (password === "") {
    errors.password = "Enter your password.";
  } else if (mode === "register" && password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return errors;
}

/**
 * Checks a note on a saved recipe.
 * @param {string} note
 * @returns {string} An error message, or an empty string when the note is fine.
 */
export function validateNote(note) {
  if (note.length > MAX_NOTE_LENGTH) {
    return `The note can be at most ${MAX_NOTE_LENGTH} characters.`;
  }

  return "";
}
