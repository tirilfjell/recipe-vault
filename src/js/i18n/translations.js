/**
 * Every user-facing string in the application, in English and Norwegian.
 *
 * Keeping the strings here rather than in the modules that show them means a
 * language can be added by adding one object, and it makes it obvious when a
 * translation is missing. The keys are grouped by the part of the interface they
 * belong to, and the two objects deliberately hold exactly the same keys.
 *
 * A string with a {placeholder} is filled in by the t() function in i18n.js.
 */

/** English strings. This is the fallback when a key is missing elsewhere. */
const en = {
  "language.name": "English",

  // Header and shell -------------------------------------------------------
  "app.name": "Recipe Vault",
  "app.skipLink": "Skip to main content",
  "app.signOut": "Sign out",
  "app.settings": "Settings",

  // Sign-in view -----------------------------------------------------------
  "auth.title": "Your recipes, in one place",
  "auth.lead":
    "Search thousands of recipes, open the full method and ingredient list, and keep the ones you like in your own account. Sign in to get started.",
  "auth.modeLabel": "Choose sign in or create account",
  "auth.signIn": "Sign in",
  "auth.createAccount": "Create account",
  "auth.hintSignIn": "Sign in to browse recipes and to see the ones you have saved.",
  "auth.hintRegister":
    "Choose a password of at least 6 characters. Your saved recipes are private to your account.",
  "auth.email": "Email address",
  "auth.password": "Password",
  "auth.accountCreated": "Your account was created. Welcome!",
  "auth.signedOut": "You have been signed out.",

  // Firebase setup notice --------------------------------------------------
  "setup.title": "Firebase is not configured yet",
  "setup.body":
    "Copy .env.example to .env and fill in the values from your own Firebase project, then start the app again. The steps are described in readme.md.",

  // Validation -------------------------------------------------------------
  "validation.emailRequired": "Enter your email address.",
  "validation.emailInvalid": "That email address does not look right.",
  "validation.emailIncomplete": "Enter a complete email address, for example name@example.com.",
  "validation.passwordRequired": "Enter your password.",
  "validation.passwordShort": "The password must be at least 6 characters long.",
  "validation.noteTooLong": "The note can be at most {max} characters.",

  // Authentication errors --------------------------------------------------
  "authError.wrongCredentials": "The email address or password is not correct.",
  "authError.noAccount": "There is no account with that email address.",
  "authError.emailInUse":
    "There is already an account with that email address. Try signing in instead.",
  "authError.tooManyAttempts": "Too many attempts. Please wait a moment before trying again.",
  "authError.notEnabled": "Email and password sign-in is not enabled for this Firebase project yet.",
  "authError.generic": "Something went wrong while signing in. Please try again.",

  // Recipe browser ---------------------------------------------------------
  "browse.title": "Browse recipes",
  "browse.searchLabel": "Search by name",
  "browse.searchPlaceholder": "For example: pasta",
  "browse.searchButton": "Search",
  "browse.categoryLabel": "Category",
  "browse.allCategories": "All categories",
  "browse.sortLabel": "Sort by",
  "browse.sortNameAsc": "Name (A–Z)",
  "browse.sortNameDesc": "Name (Z–A)",
  "browse.sortCategory": "Category (A–Z)",
  "browse.sortArea": "Cuisine (A–Z)",
  "browse.loading": "Loading recipes…",
  "browse.noMatches": "No recipes matched. Try another search term or another category.",
  "browse.countOne": "1 recipe",
  "browse.countMany": "{count} recipes",
  "browse.countFiltered": "{shown} of {total}",

  // Recipe categories -----------------------------------------------------
  // The API serves these in English and they are also the values the filter
  // matches on, so only the label shown to the user is translated. The cuisines
  // on the cards are not: TheMealDB lists around 190 of them and they are
  // nationalities rather than a fixed vocabulary.
  "category.Beef": "Beef",
  "category.Breakfast": "Breakfast",
  "category.Chicken": "Chicken",
  "category.Dessert": "Dessert",
  "category.Goat": "Goat",
  "category.Lamb": "Lamb",
  "category.Miscellaneous": "Miscellaneous",
  "category.Pasta": "Pasta",
  "category.Pork": "Pork",
  "category.Seafood": "Seafood",
  "category.Side": "Side",
  "category.Starter": "Starter",
  "category.Vegan": "Vegan",
  "category.Vegetarian": "Vegetarian",

  // Recipe card and dialog -------------------------------------------------
  "recipe.view": "View recipe",
  "recipe.viewLabel": "View the recipe for {name}",
  "recipe.save": "Save",
  "recipe.saved": "Saved",
  "recipe.saveLabel": "Save {name} to your recipes",
  "recipe.savedLabel": "Saved: {name}. Press to remove it from your recipes",
  "recipe.removeLabel": "Remove {name} from your saved recipes",
  "recipe.photograph": "Photograph of {name}",
  "recipe.noPhotograph": "No photograph available for {name}",
  "recipe.loading": "Loading recipe…",
  "recipe.close": "Close",
  "recipe.closeLabel": "Close the recipe",
  "recipe.ingredients": "Ingredients",
  "recipe.method": "Method",
  "recipe.watchOnYouTube": "Watch the recipe on YouTube",
  "recipe.toTaste": "To taste",
  "recipe.unknown": "Unknown",
  "recipe.uncategorised": "Uncategorised",
  "recipe.notFound": "That recipe could not be found.",
  "recipe.openFailed": "The recipe could not be opened.",

  // Saved recipes ----------------------------------------------------------
  "saved.title": "Saved recipes",
  "saved.count": "{count} saved",
  "saved.empty": "You have not saved any recipes yet. Use the Save button on a recipe to keep it here.",
  "saved.loadFailed": "Your saved recipes could not be loaded. Please reload the page and try again.",
  "saved.noteLabel": "Note",
  "saved.notePlaceholder": "For example: halve the chilli",
  "saved.saveNote": "Save note",
  "saved.noteSaved": "Your note was saved.",
  "saved.noteFailed": "The note could not be saved. Please try again.",
  "saved.remove": "Remove",
  "saved.savedRecipe": "{name} was saved.",
  "saved.removedRecipe": "{name} was removed.",
  "saved.saveFailed": "The recipe could not be saved. Please try again.",
  "saved.removeFailed": "The recipe could not be removed. Please try again.",
  "saved.signInFirst": "Please sign in to save recipes.",

  // Dinner wheel -----------------------------------------------------------
  "wheel.title": "Can't decide?",
  "wheel.spin": "Spin the wheel",
  "wheel.idle": "Give the wheel a spin and let it choose your dinner.",
  "wheel.empty": "Search for recipes to fill the wheel.",
  "wheel.spinning": "Spinning the wheel…",
  "wheel.result": "Tonight you are cooking {name}. Opening the recipe…",

  // Settings ---------------------------------------------------------------
  "settings.title": "Settings",
  "settings.open": "Open settings",
  "settings.close": "Close settings",
  "settings.languageHeading": "Language",
  "settings.languageHint": "The whole interface changes straight away.",
  "settings.themeHeading": "Appearance",
  "settings.themeHint": "Light or dark. Your choice is remembered on this device.",
  "settings.themeLight": "Light",
  "settings.themeDark": "Dark",
  "settings.dangerHeading": "Delete my account",
  "settings.dangerHint":
    "This deletes your account and every recipe you have saved. It cannot be undone.",
  "settings.deleteButton": "Delete my account",
  "settings.deleteConfirmLabel": "Type {word} to confirm",
  "settings.deleteConfirm": "Delete everything",
  "settings.deleteCancel": "Cancel",
  "settings.deleteWord": "DELETE",
  "settings.deleteMismatch": "Type {word} exactly to confirm.",
  "settings.deleteDone": "Your account and saved recipes were deleted.",
  "settings.deleteFailed": "Your account could not be deleted. Please try again.",
  "settings.deleteNeedsRecentLogin":
    "For your security, please sign out and sign in again before deleting your account.",

  // API errors -------------------------------------------------------------
  "apiError.timeout": "The recipe service took too long to answer. Please try again.",
  "apiError.offline": "The server could not be reached. Please check your internet connection.",
  "apiError.loadFailed": "The recipes could not be loaded. Please try again.",
  "apiError.loadFailedOffline":
    "The recipes could not be loaded. Please check your internet connection and try again.",
  "app.startFailed": "The application could not be started. Please reload the page.",

  // Footer -----------------------------------------------------------------
  "footer.label": "Footer",
  "footer.tagline": "Your recipes, in one place. Search, cook and keep the ones you love.",
  "footer.recipesHeading": "Recipes",
  "footer.aboutHeading": "About",
  "footer.dataCredit": "Recipe data by TheMealDB",
  "footer.authCredit": "Accounts secured by Firebase",
  "footer.legal": "© 2026 Recipe Vault. Recipe content belongs to its respective authors.",
};

/** Norwegian (bokmål) strings. */
const nb = {
  "language.name": "Norsk",

  // Header and shell -------------------------------------------------------
  "app.name": "Oppskriftsboka",
  "app.skipLink": "Gå til hovedinnholdet",
  "app.signOut": "Logg ut",
  "app.settings": "Innstillinger",

  // Sign-in view -----------------------------------------------------------
  "auth.title": "Oppskriftene dine, på ett sted",
  "auth.lead":
    "Søk i tusenvis av oppskrifter, åpne hele fremgangsmåten og ingredienslisten, og ta vare på dem du liker i din egen konto. Logg inn for å komme i gang.",
  "auth.modeLabel": "Velg logg inn eller opprett konto",
  "auth.signIn": "Logg inn",
  "auth.createAccount": "Opprett konto",
  "auth.hintSignIn": "Logg inn for å se oppskrifter og dem du har lagret.",
  "auth.hintRegister":
    "Velg et passord på minst 6 tegn. De lagrede oppskriftene dine er private for kontoen din.",
  "auth.email": "E-postadresse",
  "auth.password": "Passord",
  "auth.accountCreated": "Kontoen din er opprettet. Velkommen!",
  "auth.signedOut": "Du er logget ut.",

  // Firebase setup notice --------------------------------------------------
  "setup.title": "Firebase er ikke satt opp ennå",
  "setup.body":
    "Kopier .env.example til .env og fyll inn verdiene fra ditt eget Firebase-prosjekt, og start appen på nytt. Fremgangsmåten står i readme.md.",

  // Validation -------------------------------------------------------------
  "validation.emailRequired": "Skriv inn e-postadressen din.",
  "validation.emailInvalid": "Den e-postadressen ser ikke riktig ut.",
  "validation.emailIncomplete": "Skriv inn en fullstendig e-postadresse, for eksempel navn@eksempel.no.",
  "validation.passwordRequired": "Skriv inn passordet ditt.",
  "validation.passwordShort": "Passordet må være minst 6 tegn langt.",
  "validation.noteTooLong": "Notatet kan være på høyst {max} tegn.",

  // Authentication errors --------------------------------------------------
  "authError.wrongCredentials": "E-postadressen eller passordet er ikke riktig.",
  "authError.noAccount": "Det finnes ingen konto med den e-postadressen.",
  "authError.emailInUse":
    "Det finnes allerede en konto med den e-postadressen. Prøv å logge inn i stedet.",
  "authError.tooManyAttempts": "For mange forsøk. Vent et øyeblikk før du prøver igjen.",
  "authError.notEnabled": "Innlogging med e-post og passord er ikke slått på for dette Firebase-prosjektet ennå.",
  "authError.generic": "Noe gikk galt under innloggingen. Prøv igjen.",

  // Recipe browser ---------------------------------------------------------
  "browse.title": "Utforsk oppskrifter",
  "browse.searchLabel": "Søk etter navn",
  "browse.searchPlaceholder": "For eksempel: pasta",
  "browse.searchButton": "Søk",
  "browse.categoryLabel": "Kategori",
  "browse.allCategories": "Alle kategorier",
  "browse.sortLabel": "Sorter etter",
  "browse.sortNameAsc": "Navn (A–Å)",
  "browse.sortNameDesc": "Navn (Å–A)",
  "browse.sortCategory": "Kategori (A–Å)",
  "browse.sortArea": "Kjøkken (A–Å)",
  "browse.loading": "Laster oppskrifter…",
  "browse.noMatches": "Ingen oppskrifter passet. Prøv et annet søkeord eller en annen kategori.",
  "browse.countOne": "1 oppskrift",
  "browse.countMany": "{count} oppskrifter",
  "browse.countFiltered": "{shown} av {total}",

  // Recipe categories -----------------------------------------------------
  "category.Beef": "Storfe",
  "category.Breakfast": "Frokost",
  "category.Chicken": "Kylling",
  "category.Dessert": "Dessert",
  "category.Goat": "Geit",
  "category.Miscellaneous": "Diverse",
  "category.Lamb": "Lam",
  "category.Pasta": "Pasta",
  "category.Pork": "Svin",
  "category.Seafood": "Sjømat",
  "category.Side": "Tilbehør",
  "category.Starter": "Forrett",
  "category.Vegan": "Vegansk",
  "category.Vegetarian": "Vegetarisk",

  // Recipe card and dialog -------------------------------------------------
  "recipe.view": "Se oppskrift",
  "recipe.viewLabel": "Se oppskriften for {name}",
  "recipe.save": "Lagre",
  "recipe.saved": "Lagret",
  "recipe.saveLabel": "Lagre {name} i oppskriftene dine",
  "recipe.savedLabel": "Lagret: {name}. Trykk for å fjerne den fra oppskriftene dine",
  "recipe.removeLabel": "Fjern {name} fra de lagrede oppskriftene dine",
  "recipe.photograph": "Fotografi av {name}",
  "recipe.noPhotograph": "Ingen fotografi tilgjengelig for {name}",
  "recipe.loading": "Laster oppskrift…",
  "recipe.close": "Lukk",
  "recipe.closeLabel": "Lukk oppskriften",
  "recipe.ingredients": "Ingredienser",
  "recipe.method": "Fremgangsmåte",
  "recipe.watchOnYouTube": "Se oppskriften på YouTube",
  "recipe.toTaste": "Etter smak",
  "recipe.unknown": "Ukjent",
  "recipe.uncategorised": "Uten kategori",
  "recipe.notFound": "Den oppskriften ble ikke funnet.",
  "recipe.openFailed": "Oppskriften kunne ikke åpnes.",

  // Saved recipes ----------------------------------------------------------
  "saved.title": "Lagrede oppskrifter",
  "saved.count": "{count} lagret",
  "saved.empty": "Du har ikke lagret noen oppskrifter ennå. Bruk Lagre-knappen på en oppskrift for å ta vare på den her.",
  "saved.loadFailed": "De lagrede oppskriftene dine kunne ikke lastes. Last siden på nytt og prøv igjen.",
  "saved.noteLabel": "Notat",
  "saved.notePlaceholder": "For eksempel: halver chilien",
  "saved.saveNote": "Lagre notat",
  "saved.noteSaved": "Notatet ditt er lagret.",
  "saved.noteFailed": "Notatet kunne ikke lagres. Prøv igjen.",
  "saved.remove": "Fjern",
  "saved.savedRecipe": "{name} er lagret.",
  "saved.removedRecipe": "{name} er fjernet.",
  "saved.saveFailed": "Oppskriften kunne ikke lagres. Prøv igjen.",
  "saved.removeFailed": "Oppskriften kunne ikke fjernes. Prøv igjen.",
  "saved.signInFirst": "Logg inn for å lagre oppskrifter.",

  // Dinner wheel -----------------------------------------------------------
  "wheel.title": "Kan du ikke bestemme deg?",
  "wheel.spin": "Snurr hjulet",
  "wheel.idle": "Snurr hjulet og la det velge middagen for deg.",
  "wheel.empty": "Søk etter oppskrifter for å fylle hjulet.",
  "wheel.spinning": "Snurrer hjulet…",
  "wheel.result": "I kveld lager du {name}. Åpner oppskriften…",

  // Settings ---------------------------------------------------------------
  "settings.title": "Innstillinger",
  "settings.open": "Åpne innstillinger",
  "settings.close": "Lukk innstillinger",
  "settings.languageHeading": "Språk",
  "settings.languageHint": "Hele grensesnittet endres med én gang.",
  "settings.themeHeading": "Utseende",
  "settings.themeHint": "Lyst eller mørkt. Valget ditt huskes på denne enheten.",
  "settings.themeLight": "Lyst",
  "settings.themeDark": "Mørkt",
  "settings.dangerHeading": "Slett kontoen min",
  "settings.dangerHint":
    "Dette sletter kontoen din og alle oppskriftene du har lagret. Det kan ikke angres.",
  "settings.deleteButton": "Slett kontoen min",
  "settings.deleteConfirmLabel": "Skriv {word} for å bekrefte",
  "settings.deleteConfirm": "Slett alt",
  "settings.deleteCancel": "Avbryt",
  "settings.deleteWord": "SLETT",
  "settings.deleteMismatch": "Skriv {word} helt likt for å bekrefte.",
  "settings.deleteDone": "Kontoen din og de lagrede oppskriftene er slettet.",
  "settings.deleteFailed": "Kontoen din kunne ikke slettes. Prøv igjen.",
  "settings.deleteNeedsRecentLogin":
    "Av sikkerhetsgrunner må du logge ut og inn igjen før du sletter kontoen din.",

  // API errors -------------------------------------------------------------
  "apiError.timeout": "Oppskriftstjenesten brukte for lang tid på å svare. Prøv igjen.",
  "apiError.offline": "Serveren kunne ikke nås. Sjekk internettforbindelsen din.",
  "apiError.loadFailed": "Oppskriftene kunne ikke lastes. Prøv igjen.",
  "apiError.loadFailedOffline":
    "Oppskriftene kunne ikke lastes. Sjekk internettforbindelsen din og prøv igjen.",
  "app.startFailed": "Applikasjonen kunne ikke startes. Last siden på nytt.",

  // Footer -----------------------------------------------------------------
  "footer.label": "Bunntekst",
  "footer.tagline": "Oppskriftene dine, på ett sted. Søk, lag mat og ta vare på dem du elsker.",
  "footer.recipesHeading": "Oppskrifter",
  "footer.aboutHeading": "Om",
  "footer.dataCredit": "Oppskriftsdata fra TheMealDB",
  "footer.authCredit": "Kontoer sikret av Firebase",
  "footer.legal": "© 2026 Oppskriftsboka. Oppskriftsinnholdet tilhører sine respektive forfattere.",
};

/** The available languages, keyed by the code used in the interface. */
export const translations = { en, nb };

/** The language used when nothing is stored and the browser gives no hint. */
export const DEFAULT_LANGUAGE = "en";
