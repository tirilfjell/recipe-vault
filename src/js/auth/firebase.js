/**
 * Firebase set-up.
 *
 * The configuration is injected at build time by Webpack (see webpack.config.js)
 * and read from a .env file that is never committed. The services are created
 * lazily, so a missing configuration produces one clear error instead of a
 * crash somewhere deep inside the SDK.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/* global __FIREBASE_CONFIG__ */
// Replaced with a literal object by webpack.DefinePlugin at build time.
const firebaseConfig = __FIREBASE_CONFIG__;

/**
 * Error thrown when the project has not been configured yet.
 */
export class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigurationError";
  }
}

let app;
let auth;
let database;

/**
 * Whether a Firebase configuration was supplied at build time.
 * @returns {boolean}
 */
export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain);
}

/** Creates the Firebase app once and reuses it afterwards. */
function getApp() {
  if (!isFirebaseConfigured()) {
    throw new ConfigurationError(
      "Firebase is not configured. Copy .env.example to .env and fill in the values from your Firebase project.",
    );
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
  }

  return app;
}

/**
 * The Authentication service.
 * @returns {import("firebase/auth").Auth}
 */
export function getFirebaseAuth() {
  if (!auth) {
    auth = getAuth(getApp());
  }

  return auth;
}

/**
 * The Firestore database.
 * @returns {import("firebase/firestore").Firestore}
 */
export function getFirebaseDatabase() {
  if (!database) {
    database = getFirestore(getApp());
  }

  return database;
}
