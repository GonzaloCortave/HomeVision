# HomeVision

HomeVision Review Page take-home implementation.

## Mock Contract

The challenge references `review_mock.json` and `example_document.pdf`, but those
assets are not available in this repository. The local fixture in
`src/data/reviewMock.ts` follows this inferred current-review contract and points
to the local sample uploaded document at
`/local-sample-uploaded-document.pdf`.

| Field         | Type                                              | Example                                        | Source                       | Fallback assumption                                                           |
| ------------- | ------------------------------------------------- | ---------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- |
| `name`        | `string`                                          | `123-maple-appraisal.pdf`                      | Challenge field description  | Uploaded document display name.                                               |
| `uploaded_at` | ISO timestamp string                              | `2026-05-07T14:18:00.000Z`                     | Challenge field description  | Timestamp for the latest uploaded version only.                               |
| `status`      | `created \| processing \| on_review \| submitted` | `on_review`                                    | Challenge workflow states    | The review page uses `on_review` for the default fixture.                     |
| `version`     | `number`                                          | `2`                                            | Challenge versioning rule    | New uploads increment this number; historical versions are not returned.      |
| `user`        | object                                            | `{ id, name, email }`                          | Challenge field description  | Represents the reviewer or assigned user shown in the header.                 |
| `issues`      | array                                             | `[{ id, severity, page, title, description }]` | Challenge issue requirements | `critical`, `major`, and `minor` severities are enough for MVP behavior.      |
| `document`    | object                                            | `{ url, pages }`                               | Challenge PDF requirement    | `url` points to a local searchable PDF; `pages` provides basic page metadata. |

Important fallback notes:

- The fixture is intentionally named as fallback data so it can be replaced when
  the real mock JSON becomes available.
- `/local-sample-uploaded-document.pdf` is a real PDF file. It is text-based
  rather than a scanned image PDF, so browser-native PDF search can find terms
  such as `HomeVision`, `critical issue`, and `flood certification`.
- `src/data/reviewMock.ts` also includes small review variants for future tests:
  blocked, minor-only, no-issues, non-reviewable statuses, and missing-document.
- The app must not add fake issue resolution. Critical and major issues are
  fixed outside the app and require a new upload.
