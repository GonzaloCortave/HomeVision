# HomeVision

HomeVision Review Page take-home implementation.

## Mock Contract

The challenge references `review_mock.json` and `example_document.pdf`, but those
assets are not available in this repository. The local fixture in
`src/features/review/data/reviewMock.ts` follows this inferred current-review
contract and points to the local sample uploaded document at
`/local-sample-uploaded-document.pdf`.

| Field         | Type                                              | Example                                        | Source                       | Fallback assumption                                                                                                       |
| ------------- | ------------------------------------------------- | ---------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `name`        | `string`                                          | `123-maple-appraisal.pdf`                      | Challenge field description  | Uploaded document display name.                                                                                           |
| `uploaded_at` | ISO timestamp string                              | `2026-05-07T14:18:00.000Z`                     | Challenge field description  | Timestamp for the latest uploaded version only.                                                                           |
| `status`      | `created \| processing \| on_review \| submitted` | `on_review`                                    | Challenge workflow states    | The review page uses `on_review` for the default fixture.                                                                 |
| `version`     | `number`                                          | `2`                                            | Challenge versioning rule    | New uploads increment this number; historical versions are not returned.                                                  |
| `user`        | object                                            | `{ id, name, email }`                          | Challenge field description  | Represents the reviewer or assigned user shown in the header.                                                             |
| `issues`      | array                                             | `[{ id, severity, page, title, description }]` | Challenge issue requirements | `critical`, `major`, and `minor` severities are enough for MVP behavior.                                                  |
| `document`    | object                                            | `{ url, pages }`                               | Challenge PDF requirement    | `url` points to a local searchable PDF, or `null` when the document is unavailable; `pages` provides basic page metadata. |

Important fallback notes:

- The fixture is intentionally named as fallback data so it can be replaced when
  the real mock JSON becomes available.
- `/local-sample-uploaded-document.pdf` is a real PDF file. It is text-based
  rather than a scanned image PDF, so browser-native PDF search can find terms
  such as `HomeVision`, `critical issue`, and `flood certification`.
- `src/features/review/data/reviewMock.ts` also includes small review variants
  for future tests: blocked, minor-only, no-issues, non-reviewable statuses, and
  missing-document.
- `src/features/review/data/reviewClient.ts` exposes the Promise-backed
  `loadReview()` boundary the Review Page will use for loading and error states.
- The app must not add fake issue resolution. Critical and major issues are
  fixed outside the app and require a new upload.

## Architecture

The app uses a feature-oriented structure:

```txt
src/
  app/                    # app composition
  features/review/         # review page, review-specific orchestration, data, and domain
  shared/components/       # reusable UI that does not import review types
  styles/
  test/
```

Review business rules live in `src/features/review/domain` as pure functions.
`DocumentViewer` lives in `src/shared/components` because it accepts generic PDF
viewer props and receives review-specific copy from the review feature.

## Code Conventions

- React components are declared as typed `const` arrow functions, not `function`
  declarations.
- Feature-specific UI stays under `src/features/<feature>`.
- Shared UI must not import feature-specific domain types.
