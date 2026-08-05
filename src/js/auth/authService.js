/**
 * Authentication, wrapped so the rest of the application never imports the
 * Firebase SDK directly.
 *
 * Firebase reports failures as machine codes such as "auth/invalid-credential".
 * They are translated here into sentences a user can act on, and the raw code is
 * left in the console for debugging.
 */

import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { t } from "../i18n/i18n.js";
import { getFirebaseAuth } from "./firebase.js";

/**
 * Error type carrying a message that is safe to show to the user.
 */
export class AuthError extends Error {
  /**
   * @param {string} message
   * @param {unknown} [cause]
   */
  constructor(message, cause) {
    super(message);
    this.name = "AuthError";
    this.cause = cause;
  }
}

/* Firebase error codes mapped to translation keys. The key is looked up when the
   error is thrown rather than here, so the message is always in the language the
   user is currently reading. */
const ERROR_KEYS = {
  "auth/invalid-email": "validation.emailInvalid",
  "auth/missing-password": "validation.passwordRequired",
  "auth/weak-password": "validation.passwordShort",
  "auth/email-already-in-use": "authError.emailInUse",
  "auth/invalid-credential": "authError.wrongCredentials",
  "auth/wrong-password": "authError.wrongCredentials",
  "auth/user-not-found": "authError.noAccount",
  "auth/too-many-requests": "authError.tooManyAttempts",
  "auth/network-request-failed": "apiError.offline",
  "auth/operation-not-allowed": "authError.notEnabled",
  "auth/requires-recent-login": "settings.deleteNeedsRecentLogin",
};

/**
 * Turns a Firebase error into an AuthError with a readable message.
 * @param {unknown} error
 * @returns {AuthError}
 */
function toAuthError(error) {
  const code = error?.code ?? "";
  console.error("Authentication failed:", code || error);

  return new AuthError(t(ERROR_KEYS[code] ?? "authError.generic"), error);
}

/**
 * Calls the handler with the signed-in user, or with null when signed out.
 * Fires once straight away with the current state, and again on every change.
 * @param {(user: import("firebase/auth").User|null) => void} handler
 * @returns {() => void} Function that stops listening.
 */
export function observeUser(handler) {
  return onAuthStateChanged(getFirebaseAuth(), handler, (error) => {
    console.error("The authentication state could not be read:", error);
    handler(null);
  });
}

/**
 * Signs an existing user in.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("firebase/auth").User>}
 * @throws {AuthError}
 */
export async function signIn(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    return credential.user;
  } catch (error) {
    throw toAuthError(error);
  }
}

/**
 * Creates a new account and signs it in.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("firebase/auth").User>}
 * @throws {AuthError}
 */
export async function register(email, password) {
  try {
    const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    return credential.user;
  } catch (error) {
    throw toAuthError(error);
  }
}

/**
 * Signs the current user out.
 * @returns {Promise<void>}
 * @throws {AuthError}
 */
export async function signOutUser() {
  try {
    await signOut(getFirebaseAuth());
  } catch (error) {
    throw toAuthError(error);
  }
}

/**
 * Deletes the signed-in account.
 *
 * Only the account itself is removed here. The saved recipes are deleted first by
 * the caller, because once the account is gone the Firestore rules would refuse
 * the write and the documents would be left behind with no owner.
 *
 * Firebase refuses this with "auth/requires-recent-login" when the session is
 * old, which is mapped above to an instruction to sign in again.
 *
 * @returns {Promise<void>}
 * @throws {AuthError}
 */
export async function deleteAccount() {
  const { currentUser } = getFirebaseAuth();

  if (!currentUser) {
    throw new AuthError(t("settings.deleteFailed"));
  }

  try {
    await deleteUser(currentUser);
  } catch (error) {
    throw toAuthError(error);
  }
}
