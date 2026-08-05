/**
 * The saved recipes of one user, stored in Cloud Firestore.
 *
 * A saved recipe is written to `users/{userId}/favourites/{recipeId}`. Using the
 * recipe id as the document id means the same recipe can never be saved twice,
 * and it makes both removing and looking one up a direct hit rather than a
 * search.
 *
 * The rules in firestore.rules restrict every document under `users/{userId}` to
 * that signed-in user, so the database enforces the same rule as the interface.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { t } from "../i18n/i18n.js";
import { getFirebaseDatabase } from "../auth/firebase.js";

/**
 * Error type for problems while reading or writing saved recipes.
 */
export class FavouritesError extends Error {
  /**
   * @param {string} message
   * @param {unknown} [cause]
   */
  constructor(message, cause) {
    super(message);
    this.name = "FavouritesError";
    this.cause = cause;
  }
}

/**
 * Reference to the favourites collection of one user.
 * @param {string} userId
 */
function favouritesCollection(userId) {
  return collection(getFirebaseDatabase(), "users", userId, "favourites");
}

/**
 * Listens to the saved recipes and reports every change.
 *
 * A listener rather than a one-off read keeps the interface in step with the
 * database, including changes made in another browser tab.
 *
 * @param {string} userId
 * @param {(favourites: object[]) => void} onChange Called with the current list.
 * @param {(error: FavouritesError) => void} onError Called when reading fails.
 * @returns {() => void} Function that stops listening.
 */
export function observeFavourites(userId, onChange, onError) {
  const savedQuery = query(favouritesCollection(userId), orderBy("savedAt", "desc"));

  return onSnapshot(
    savedQuery,
    (snapshot) => {
      const favourites = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      onChange(favourites);
    },
    (error) => {
      console.error("The saved recipes could not be read:", error);
      onError(
        new FavouritesError(
          t("saved.loadFailed"),
          error,
        ),
      );
    },
  );
}

/**
 * Saves a recipe for one user.
 *
 * Only the fields needed to show the card again are stored, so the database does
 * not hold a second copy of everything the API already serves.
 *
 * @param {string} userId
 * @param {object} recipe A recipe from mealApi.
 * @returns {Promise<void>}
 * @throws {FavouritesError}
 */
export async function saveFavourite(userId, recipe) {
  try {
    await setDoc(doc(favouritesCollection(userId), recipe.id), {
      name: recipe.name,
      category: recipe.category,
      area: recipe.area,
      thumbnail: recipe.thumbnail,
      note: "",
      // The server clock is used, so the order does not depend on the clock of
      // the machine that saved the recipe.
      savedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("The recipe could not be saved:", error);
    throw new FavouritesError(t("saved.saveFailed"), error);
  }
}

/**
 * Updates the note on a saved recipe.
 * @param {string} userId
 * @param {string} recipeId
 * @param {string} note
 * @returns {Promise<void>}
 * @throws {FavouritesError}
 */
export async function updateFavouriteNote(userId, recipeId, note) {
  try {
    await updateDoc(doc(favouritesCollection(userId), recipeId), { note });
  } catch (error) {
    console.error("The note could not be saved:", error);
    throw new FavouritesError(t("saved.noteFailed"), error);
  }
}

/**
 * Removes a saved recipe.
 * @param {string} userId
 * @param {string} recipeId
 * @returns {Promise<void>}
 * @throws {FavouritesError}
 */
export async function removeFavourite(userId, recipeId) {
  try {
    await deleteDoc(doc(favouritesCollection(userId), recipeId));
  } catch (error) {
    console.error("The recipe could not be removed:", error);
    throw new FavouritesError(t("saved.removeFailed"), error);
  }
}

/**
 * Deletes every saved recipe belonging to one user.
 *
 * Used when an account is deleted. This runs while the user is still signed in,
 * because the Firestore rules only allow a user to delete their own documents and
 * that permission disappears with the account.
 *
 * @param {string} userId
 * @returns {Promise<void>}
 * @throws {FavouritesError}
 */
export async function removeAllFavourites(userId) {
  try {
    const snapshot = await getDocs(favouritesCollection(userId));

    // The deletes are issued together rather than one after another, so a long
    // list does not take one round trip per recipe.
    await Promise.all(snapshot.docs.map((document) => deleteDoc(document.ref)));
  } catch (error) {
    console.error("The saved recipes could not be deleted:", error);
    throw new FavouritesError(t("settings.deleteFailed"), error);
  }
}
