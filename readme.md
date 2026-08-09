# Final project – Recipe Vault

A recipe app where a signed-in user can search thousands of recipes, open the full ingredient
list and method, and keep the ones they like in their own account. The front end is written in
plain HTML, CSS and JavaScript, bundled with Webpack. Accounts and saved recipes are handled by
Firebase.

## Links

- **GitHub repository:** https://github.com/tirilfjell/recipe-vault
- **Live version (Firebase Hosting):** https://recipe-valut.web.app
- **Figma prototype:** `RecipeVaultPrototype.fig` in this folder.

## Features

- **Accounts.** Sign in or create an account with email and password, through Firebase
  Authentication. Signing out returns to the sign-in screen.
- **Protected content.** The recipe browser and the saved recipes are only reachable once signed
  in, and the Firestore rules in `firestore.rules` allow a user to read and write nothing but
  their own data.
- **Live recipe data.** Every recipe comes from TheMealDB at runtime. Nothing is hardcoded in the
  HTML.
- **Search, filter and sort.** Search recipes by name, narrow the result to one of the 14
  categories, and sort by name, category or cuisine.
- **Recipe details.** Each recipe opens in a dialog with a photograph, the measured ingredient
  list, the method split into readable paragraphs, and a link to the video where one exists.
- **Saved recipes.** Save a recipe to your account, add a personal note to it, and remove it
  again. The list updates itself through a Firestore listener, so it stays correct even with the
  app open in two tabs.
- **Three screens.** The signed-in area is split into the recipe browser, the saved recipes and
  the settings, reached from the header. The current screen is kept in the URL, so the browser's
  back button works and a screen can be linked to directly.
- **The dinner wheel.** A spinning wheel that picks a recipe at random for anyone who cannot
  decide what to cook. It offers whatever is currently on screen, so narrowing the category
  narrows the wheel too.
- **Two languages.** The whole interface switches between English and Norwegian without a reload.
  The choice is remembered on the device.
- **Light and dark.** Follows the operating system until a choice is made, and remembers it after.
- **Delete my account.** Removes the account and every saved recipe, behind a type-to-confirm step.
- **Error handling.** Failed requests, timeouts, rejected sign-ins and refused database writes
  are all reported to the user in plain language.
- **Responsive.** One column on a phone, two from 1088 px upwards.
- **Motion.** Cards cascade in, hover states lift, the wheel spins. All of it is switched off for
  anyone whose system asks for reduced motion.

## Running the project

```bash
cd Final_project
npm install
npm start          # development server on http://localhost:4004
```

```bash
npm run build      # production build into dist/
npm run preview    # serves the production build locally
npm test           # runs the unit tests
```

`dist/` is what gets deployed – that is the folder to point Firebase Hosting or Netlify at.

## Tests

```bash
npm test
```

62 tests, run by Node's own test runner, so the project needs no test dependency:

- **`tests/recipeFilters.test.js`** – the filtering and sorting, including that they return new
  lists rather than reordering the one they were given.
- **`tests/validators.test.js`** – the form rules: which fields report a problem and when, and that
  a short password is only rejected when an account is being created.
- **`tests/i18n.test.js`** – that both languages hold exactly the same keys, with the same
  placeholders and no empty strings. A key missing from Norwegian would otherwise show up as
  English text in a Norwegian interface, which is easy to miss by eye.
- **`tests/contrast.test.js`** – every text-and-background pairing in both themes, and every wheel
  segment, calculated against the WCAG AA minimum of 4.5:1.

## Running it against your own Firebase project

Only needed to run the project from a fresh clone: the deployed site above is already configured,
and `.env` is deliberately not in the repository, so a clone has no project to talk to until one is
supplied. Until then the app shows a notice saying so rather than a broken sign-in form.

It takes about five minutes.

1. Go to https://console.firebase.google.com and create a project.
2. Open **Build → Authentication → Get started** and enable the **Email/Password** provider.
3. Open **Build → Firestore Database → Create database**. Start in production mode and pick a
   location.
4. Publish the database rules. Either paste `firestore.rules` from this folder into
   **Firestore Database → Rules** and publish, or, with the Firebase CLI installed and logged in:

   ```bash
   firebase deploy --only firestore:rules
   ```

   `firebase.json` in this folder already points the CLI at the rules file.
5. Open **Project settings → General**. Under "Your apps", register a **Web app**. Copy the values
   from the `firebaseConfig` object it shows you.
6. Copy `.env.example` to `.env` and paste the values in:

   ```bash
   cp .env.example .env
   ```

7. Start the app. Until this is done, the app shows a notice explaining that Firebase is not
   configured yet instead of a broken sign-in form.

When the site is deployed, add the deployed domain under **Authentication → Settings → Authorized
domains**, otherwise Firebase will refuse the sign-in from that domain.

## Project structure

The assignment brief lists `assets/`, `css/`, `js/` and `index.html` directly inside
`Final_project/`. They are inside `src/` here instead, because the project is bundled with
Webpack: `src/` is the source Webpack reads, and `dist/` is the folder it writes, which is what
gets deployed. Keeping the sources in one directory is what lets the build, the module structure
and the stylesheet imports work at all. The same folders are all present, one level down.

```
Final_project/
├── webpack.config.js       Build configuration, injects the Firebase settings
├── firestore.rules         Database rules: a user may only touch their own data
├── firebase.json           Rules and Hosting configuration for the Firebase CLI
├── .env.example            Template for the local .env file
├── package.json
├── readme.md
├── RecipeVaultPrototype.fig  Figma prototype
└── src/
    ├── index.html          Page template used by HtmlWebpackPlugin
    ├── index.js            Entry point: holds the state and wires the modules
    ├── css/
    │   ├── main.css        Entry point that imports the partials in order
    │   ├── base.css        Design tokens, reset and element defaults
    │   ├── layout.css      Page shell, header, footer, panels and grids
    │   ├── components.css  Buttons, cards, badges, dialog and messages
    │   └── auth.css        The sign-in view
    ├── js/
    │   ├── api/
    │   │   ├── mealApi.js  TheMealDB: search, lookup and categories
    │   │   └── ApiError.js
    │   ├── auth/
    │   │   ├── firebase.js     Creates the Firebase services, lazily
    │   │   └── authService.js  Sign in, register, sign out, delete, state changes
    │   ├── features/
    │   │   ├── favouritesRepository.js  The saved recipes, in Firestore
    │   │   ├── recipeFilters.js         Filtering and sorting, pure functions
    │   │   └── themeService.js          Light and dark
    │   ├── i18n/
    │   │   ├── translations.js       Every string, in English and Norwegian
    │   │   ├── i18n.js               t(), the current language and listeners
    │   │   └── applyTranslations.js  Translates the static markup
    │   ├── ui/
    │   │   ├── authPanel.js       The sign-in form and its validation
    │   │   ├── screenNav.js       The three screens and the URL hash
    │   │   ├── searchControls.js  Search field, category filter, sort order
    │   │   ├── recipeList.js      The grid of recipe cards
    │   │   ├── recipeDialog.js    The recipe detail dialog
    │   │   ├── favouritesList.js  Saved recipes, notes and removal
    │   │   ├── dinnerWheel.js     The spinning wheel that picks a recipe
    │   │   ├── settingsPanel.js   Language, appearance, account deletion
    │   │   └── feedback.js        Confirmations and errors
    │   └── utils/
    │       ├── dom.js         Element helpers
    │       └── validators.js  The validation rules
    └── assets/
        ├── favicon.svg
        └── img/recipe-placeholder.svg
```

`dist/` is generated by the build and is not committed.

## How the code is organised

Every module does one job and knows as little as possible about the others:

- **`api/mealApi.js`** is the only file that knows how TheMealDB names its fields. It returns
  recipes in the shape the app uses, so swapping the API would mean changing this one file.
- **`auth/authService.js`** is the only file that imports the Firebase Auth SDK, and
  **`features/favouritesRepository.js`** the only one that imports Firestore.
- **`features/recipeFilters.js`** holds pure functions. They take a list and return a new one,
  which makes the filtering and sorting easy to follow.
- **`ui/*`** modules build and update their own part of the page. They hold no data and report
  what happened through callbacks.
- **`i18n/*`** holds every user-facing string. A module asks for a string by key rather than
  writing it, which is what makes a second language a matter of adding one object.
- **`index.js`** is the only module that knows about all of them. It holds the state and connects
  them, so the wiring is in one readable place rather than spread out.

## Technical choices

**Why the recipe list is filtered in the browser.** TheMealDB has one endpoint that returns full
recipes (`search.php`) and one that filters by category but returns only a name, an id and a
picture (`filter.php`). Filtering the full results in the browser therefore gives the user a
complete card for every recipe, and changing the category or the sort order costs no request at
all – only a new search does.

**Why the recipe id is the Firestore document id.** A saved recipe is written to
`users/{uid}/favourites/{recipeId}`. The same recipe cannot be saved twice, and both looking one
up and removing it are a direct hit rather than a search.

**Why a Firestore listener rather than a single read.** `observeFavourites` subscribes with
`onSnapshot`. The interface then follows the database rather than a local copy of it: after a
save, the card turns into "Saved" because the listener fired, not because the button assumed the
write succeeded. That is also what keeps two open tabs in step.

**Why the configuration is injected at build time.** `webpack.config.js` reads the Firebase values
from `.env` and injects them with `DefinePlugin` as one literal object. The repository therefore
contains no project keys, and the bundle contains no reference to `process`, which does not exist
in a browser. A Firebase web configuration is not a secret in the way an API secret is – it is
visible in any browser that loads the app – so the real protection is the rules in
`firestore.rules` plus the authorized-domains list in the Firebase console. Keeping it out of the
repository is still the right default, and it lets the same code be built against a test project
and a production project.

**Why a native `<dialog>`.** `showModal()` traps focus inside the dialog, closes it on Escape and
hides the rest of the page from screen readers. Rebuilding that by hand with a `<div>` would be
considerably more code and easy to get wrong.

**Why the DOM API instead of template strings.** Cards, dialog contents and list entries are
built with `document.createElement` and `textContent`. Recipe text and user notes are inserted as
text and can never be interpreted as markup.

## Universal design

- Semantic elements throughout: `header`, `nav`-free single-level `main`, `section`, `article`,
  `form`, `footer`, `dialog`, and lists for anything that is a list.
- A skip link jumps straight to the main content.
- Every input has a real `<label>` tied to it with `for`/`id`.
- Validation messages are linked to their input with `aria-describedby`, the input is marked
  `aria-invalid` while it is wrong, and focus moves to the first field that needs correcting.
- The sign-in and create-account switch uses `aria-pressed`, so which one is active is not
  conveyed by colour alone.
- The save button says "Save" or "Saved" and carries an `aria-label` naming the recipe, so its
  state does not depend on colour either.
- Loading, empty and error states live in `role="status"` regions with `aria-live="polite"`.
- Every image has a descriptive `alt` text, and a card whose photograph fails to load falls back
  to a local drawing with an `alt` text that says so.
- All interactive elements are reachable by keyboard and have a clearly visible focus ring.
- All colours are checked against their background for a contrast ratio above the WCAG AA minimum
  of 4.5:1. The check is a test rather than a judgement by eye, so it stays true: see
  `tests/contrast.test.js`. Most pairings reach the stricter AAA level of 7:1.
- Headings run in order without skipping a level, and each screen has exactly one `h1`.
- Every button's accessible name contains its visible text, so voice control can act on what is
  on screen.
- Lighthouse reports 100 for accessibility, best practices and SEO.

## Sources

- TheMealDB API documentation – https://www.themealdb.com/api.php
- Firebase Authentication for the web – https://firebase.google.com/docs/auth/web/start
- Firestore security rules – https://firebase.google.com/docs/firestore/security/get-started
- Firestore realtime listeners – https://firebase.google.com/docs/firestore/query-data/listen
- Webpack `DefinePlugin` – https://webpack.js.org/plugins/define-plugin/
- Webpack asset modules – https://webpack.js.org/guides/asset-modules/
- The `<dialog>` element – https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
- `AbortSignal.timeout()` – https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static
- BEM naming convention – https://getbem.com/naming/
- SuperHi – https://www.superhi.com/ – the reference for the visual direction: the bold flat
  palette, the oversized tight-set headings, the pill controls and the offset shadows
- `prefers-reduced-motion` – https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- `prefers-color-scheme` – https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
- SVG arcs and the `path` element – https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
- Deleting a Firebase user – https://firebase.google.com/docs/auth/web/manage-users#delete_a_user
