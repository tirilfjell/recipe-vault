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
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

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

/** Firebase error codes mapped to messages for the user. */
const ERROR_MESSAGES = {
  "auth/invalid-email": "That email address does not look right.",
  "auth/missing-password": "Please enter your password.",
  "auth/weak-password": "The password must be at least 6 characters long.",
  "auth/email-already-in-use": "There is already an account with that email address. Try signing in instead.",
  "auth/invalid-credential": "The email address or password is not correct.",
  "auth/wrong-password": "The email address or password is not correct.",
  "auth/user-not-found": "There is no account with that email address.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment before trying again.",
  "auth/network-request-failed": "The server could not be reached. Please check your internet connection.",
  "auth/operation-not-allowed":
    "Email and password sign-in is not enabled for this Firebase project yet.",
};

/**
 * Turns a Firebase error into an AuthError with a readable message.
 * @param {unknown} error
 * @returns {AuthError}
 */
function toAuthError(error) {
  const code = error?.code ?? "";
  console.error("Authentication failed:", code || error);

  return new AuthError(
    ERROR_MESSAGES[code] ?? "Something went wrong while signing in. Please try again.",
    error,
  );
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
