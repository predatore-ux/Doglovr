# DOGLOVR

A friendly, responsive learning app for dog owners. Six practical lessons cover body language, potty and pee training, everyday cues, recall, mat training and daily care. Six starter breed guides complement quizzes, a dog profile, saved lessons and progress tracking.

## Run locally

Use Node.js 22 or later. There are **no npm dependencies** and no build step.

```sh
npm start
```

Open http://127.0.0.1:4173. Set `PORT` to use another port. The preview server binds only to your device; use a static host for production.

```sh
npm run check
npm test
```

The test suite covers state recovery, legacy data migration, progress, answers, search, routes, asset integrity and the preview server. GitHub Actions runs these checks on pushes and pull requests.

## Launch on GitHub Pages

1. In the repository, open **Settings → Pages** and choose **GitHub Actions** as the source.
2. Open **Actions → Launch on GitHub Pages → Run workflow**, choosing `main`.
3. When deployment succeeds, open the URL shown by the workflow.

The launch workflow is manual so code pushes do not unexpectedly publish changes. Later updates use the same workflow. All asset paths are relative, so the app supports a GitHub project URL such as `/Doglovr/` as well as a custom domain.

See [GitHub’s custom-workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Other static hosts

Publish **`dist/`**. No build command, backend, credentials, environment variables or database are needed. `dist/_headers` provides additional security headers for hosts supporting that format; the HTML includes a restrictive Content Security Policy for other hosts. Authentication and access policy are controlled by the host, not this frontend.

`.openai/hosting.json` identifies the existing private Sites preview. Its project ID is metadata, not a secret. GitHub Pages uses `dist/` directly and does not require that file. The Sites preview remains separate from GitHub Pages: changes pushed to GitHub do not automatically update it.

## Project structure

- `dist/data.js`: editable lesson, quiz, source and breed content.
- `dist/state.js`: pure state validation, migration, search and route logic.
- `dist/app.js`: accessible UI, routing, dialogs and event handling.
- `dist/style.css`: responsive styling and reduced-motion support.
- `dist/assets/`: bundled photos; no third-party image or font requests at runtime.
- `scripts/serve.mjs`: local preview server.
- `tests/`: Node regression and HTTP tests.
- `.github/workflows/`: checks and optional manual Pages launch.

## Data and privacy

The app stores a dog’s name, saved and completed lesson IDs, and quiz selections in `localStorage` under `doglovr`. This is local to the browser, device and website origin. It has no accounts, analytics, cookies set by the app, cloud sync, or server-side profile storage. Moving from the Sites preview to a GitHub/custom-domain origin starts a separate profile. Clearing site data removes the profile and progress. If storage is blocked or full, a visible notice explains that changes are session-only.

There are no secrets in the repository. Never commit `.env` files or access tokens. Host-level logs and authentication are governed by your hosting provider.

## Content scope

This is an educational starter release, with six lessons and six breed guides, not an exhaustive breed database. Lesson durations include a short practice activity. Breed traits describe tendencies; needs vary by individual dog. Training content uses reward-based methods. Veterinary concerns and sudden changes in toileting should be referred to a veterinarian. Specialized assistance/service-dog certification is outside this app’s scope.

Content sources and photo credits are in [ATTRIBUTION.md](ATTRIBUTION.md). Validation evidence and known limits are in [QA.md](QA.md).
