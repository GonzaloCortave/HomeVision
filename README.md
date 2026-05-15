# HomeVision Review Page

Single-page document review UI for HomeVision's AI-assisted collateral review workflow. Built with React 19, TypeScript 6 (strict), Vite 8, and Tailwind CSS 4.

HomeVision's MIRA platform automates collateral reviews for mortgage lending. Operational reviewers process high volumes of documents daily and need to quickly identify whether a review is blocked, understand what must be fixed in the source document, and submit only when blocking issues are resolved. This page is built for that workflow — fast exception triage, not decorative UI.

**Core rule:** `critical` and `major` issues block submission. `minor` issues do not.

## Reviewer Quick Path

Requires Node >=22.12.0; this submission was verified with Node 22.14.0.

```sh
npm install
npm run dev
```

Open `http://localhost:5173/` to start on the Review Page with a blocked review. Use **Upload Version 3** to open the mock re-upload harness, then choose **Clean review** or **Minor issues only** to see submit become available.

## Quick Start

```sh
node -v   # requires >=22.12.0
npm install
npm run dev
```

## Verify

```sh
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run preview # optional production-bundle smoke test
```

The five core verification commands pass cleanly at time of submission. `npm run preview` is included for an optional production-bundle smoke test.

## What Was Built

The primary user is a collateral reviewer who must inspect a PDF, understand AI-detected issues, and submit only when blocking issues are resolved.

| Area               | Description                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Review header**  | File name, status badge, version, upload timestamp (`<time>` with `dateTime`), reviewer name and email.                                                                                                                                                                                                                                                                                                   |
| **PDF viewer**     | Native `<iframe>` with accessible title. Supports Chrome Cmd+F / Ctrl+F search from the Review Page, plus an "Open searchable PDF in new tab" link for isolated PDF search when exact PDF-only results matter.                                                                                                                                                                                            |
| **Review summary** | Severity counts (critical / major / minor), blocked / ready / missing-document / non-reviewable state with operational copy explaining what to fix and where.                                                                                                                                                                                                                                             |
| **Issue list**     | Issues grouped by severity in a three-column grid, sorted by page within each group. Each card shows severity badge, page number, title, expand/collapse for long descriptions, and blocking impact text.                                                                                                                                                                                                 |
| **Submit panel**   | Always shows both actions: submit the current review when eligible, or go to Upload Page for `version + 1`. Submit is enabled only when `on_review` + zero blocking issues + document URL present; Upload remains available so reviewers can replace the document even when the current review is ready. Records local success state on submit. `aria-describedby` connects helper text to both controls. |
| **Upload page**    | Mock upload flow that lets reviewers choose the analysis outcome to simulate. The upload action creates a complete mock review, stores it in `sessionStorage`, and navigates to `/review/:reviewId`, matching the shape of a real upload API handoff.                                                                                                                                                     |
| **Mobile layout**  | Stacked layout with Document / Issues anchor links visible in the first viewport for quick navigation.                                                                                                                                                                                                                                                                                                    |
| **Edge states**    | Loading with status announcement, error with retry, missing PDF, no issues, minor-only, and local submitted confirmation — all covered by component tests.                                                                                                                                                                                                                                                |

## Assumptions And Missing Assets

The challenge references `review_mock.json` and `example_document.pdf`, but neither file was available. Rather than guess silently, I documented the gap and built explicit fallbacks.

- **Mock data** — `src/features/review/data/reviewMock.ts` provides 12 fixture variants (blocked, minor-only, no-issues, created, processing, submitted, missing-document, and combinations). Each variant is used in tests.
- **Mock upload API** — `src/features/upload/data/uploadClient.ts` is a temporary API boundary for the demo upload flow. It creates a complete review, persists it in `sessionStorage`, and returns a `reviewId`; replace this boundary with the real upload endpoint when available.
- **Fallback PDF** — `public/local-sample-uploaded-document.pdf` is a text-based PDF so browser-native Cmd+F search works with terms like _HomeVision_, _critical issue_, and _flood certification_.
- **Normalization layer** — `src/features/review/domain/reviewTypes.ts` defines a raw `ApiReview` input type and a strict `Review` output type. The `normalizeReview()` function validates the contract, coerces loose types (string page numbers, missing arrays), deduplicates issue IDs, and throws a typed `ReviewContractError` on invalid data. If the real mock shape differs, only the normalizer changes — all UI and business logic stays stable.

### Inferred API Contract

| Field         | Type                                                      | Purpose                                                                    |
| ------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| `name`        | `string`                                                  | Uploaded document display name.                                            |
| `uploaded_at` | ISO 8601 string                                           | Upload timestamp for the latest version.                                   |
| `status`      | `'created' \| 'processing' \| 'on_review' \| 'submitted'` | Review workflow state.                                                     |
| `version`     | `number`                                                  | Current document version.                                                  |
| `user`        | `{ id, name, email? }`                                    | Assigned reviewer.                                                         |
| `issues`      | `{ id, severity, page, title, description? }[]`           | AI-detected findings. Severity is exactly `critical`, `major`, or `minor`. |
| `document`    | `{ url, pages }`                                          | PDF metadata. `url` may be `null` when the document is unavailable.        |

## Business Rules

All blocking logic lives in pure functions under `src/features/review/domain/reviewSelectors.ts`, unit-tested independently from React.

1. **Blocking severities** — `critical` and `major`.
2. **Non-blocking** — `minor` issues are visible but never prevent submission.
3. **Submit eligibility** — `status === 'on_review'` AND zero blocking issues AND document URL present.
4. **Non-reviewable statuses** — `created`, `processing`, and `submitted` display the review but disable submission with clear copy explaining why.
5. **No in-app resolve** — Blocking issues are fixed by correcting the source document outside this app, then uploading the corrected document. The app does not invent a resolve action because that workflow is not supported by the product contract.
6. **Upload handoff** — The submit panel always links to `/upload` with current-review context and `nextVersion = review.version + 1`. In this demo, choosing a mock analysis outcome creates a new review in the mock upload client and routes to `/review/:reviewId`; in production, that boundary should be replaced by the real upload endpoint.
7. **Submission state machine** — `getSubmissionState()` returns a discriminated union (`not_reviewable | blocked | missing_document | ready`) so components pattern-match on state rather than recomputing eligibility.

## Architecture

Source is split by feature so the mock upload boundary can be replaced without rewriting the review UI.

```
src/
  app/                          App entry and composition root
  features/review/
    domain/                     Types, normalizeReview(), pure selectors
    data/                       Async mock client + 12 fixture variants
                                sessionStorage-backed mock review store
    hooks/                      useReviewLoader (loading/error/success)
    components/                 ReviewHeader, ReviewSummary, IssuePanel,
                                IssueList, IssueCard, SubmitPanel,
                                ReviewSectionNav, ReviewLoadStates, etc.
    utils/                      Formatting helpers (timestamps, status, counts)
    ReviewPageContainer.tsx     Data-loading boundary (fetches + state)
    ReviewPageView.tsx          Pure layout composition (props only)
  features/upload/
    data/                       Mock upload client API boundary
    UploadDocumentPage.tsx      Demo upload flow and scenario selection
  shared/components/
    DocumentViewer.tsx          Generic PDF iframe viewer
    ui/                         Button, ButtonLink, TextLink primitives
  styles/                       Tailwind base styles
```

**Key decisions:**

- **Domain-first** — Business rules are pure functions (`isBlockingIssue`, `canSubmitReview`, `getSubmissionState`). Components receive derived state; they don't compute eligibility. This makes blocking logic testable without rendering any component.
- **Immutable domain model** — All domain types use `readonly` properties and `readonly` arrays. No mutation of review data after normalization.
- **Normalization boundary** — Raw API data enters through `normalizeReview()` and is validated once. All downstream code uses the strict `Review` type with no `any` or `unknown` leaking past the boundary.
- **Container / View split** — `ReviewPageContainer` owns data fetching and local state. `ReviewPageView` is a pure layout component driven entirely by props, making it independently testable with any fixture.
- **Mock API boundary** — Upload scenarios are handled in `uploadClient.ts`, not by query-string state in the review page. The mocked client behaves like `POST /upload -> reviewId`, and `ReviewPageContainer` behaves like `GET /review/:reviewId`.
- **No global state** — Local `useState` + derived selectors. A single-page mocked workflow does not justify Redux, Zustand, or Context.
- **No UI library** — Small local primitives (`Button`, `ButtonLink`, `TextLink`) with shared Tailwind styles in `buttonStyles.ts`. The dependency surface stays minimal for this scope.
- **Component convention** — Typed `const` arrow functions with explicit prop types. No `useEffect` where an event handler or derived value suffices (only the data-loading hook uses `useEffect`).

## PDF Tradeoff

The PDF renders in a native browser `<iframe>`. This was chosen because:

- The challenge requires **Cmd+F / Ctrl+F search** across the PDF.
- Native PDF viewers in Chrome, Edge, and Firefox already provide full-document search without PDF.js.
- The embedded viewer supports the common reviewer workflow: click the PDF preview, press Cmd+F / Ctrl+F, and search across the document from the Review Page.
- The direct PDF tab uses the same native browser viewer but isolates the find results to the PDF when the same term also appears in surrounding issue text.
- PDF.js would add ~400 kB of bundle size, worker setup, text-layer accessibility work, and custom search wiring — all for a feature the browser already provides.

**If native PDF search fails** in the target reviewer environment, the next step would be PDF.js with text-layer rendering. That tradeoff was considered and documented, not ignored.

### Manual PDF QA Checklist

1. Open the app in Chrome (`npm run dev`).
2. Confirm the embedded PDF renders in the left pane.
3. Click inside the embedded PDF and use **Cmd+F** / **Ctrl+F**.
4. Search for `Search terms for QA` — confirm Chrome searches the embedded PDF from the Review Page and jumps to the match on page 3 after pressing Enter.
5. Search for `flood certification` in the embedded view — confirm Chrome finds the PDF text. If Chrome also finds the same phrase in issue cards, use the PDF-only tab for isolated PDF results.
6. Click "Open searchable PDF in new tab" and search `flood certification` — confirm the result set is PDF-only.
7. Resize the browser to mobile width — confirm the Document anchor link scrolls to the PDF.

Manual QA was performed in Chrome on May 13, 2026 against the local Vite app. The embedded PDF rendered and Cmd+F found `Search terms for QA` inside the PDF from the Review Page after pressing Enter. For terms duplicated in the surrounding issue cards, Chrome's global find may include both PDF and page-text matches; the direct PDF tab is provided as the precise PDF-only search path. The new-tab PDF view found `flood certification` as `Result 1 of 2`. Keyboard navigation and responsive checks were also run at desktop, tablet, and mobile widths with no material blockers found.

## Testing

**96 tests** across 14 suites. All behavioral, no snapshots, no Tailwind class assertions.

| Suite                  | Tests | What it covers                                                                                                                                                                                      |
| ---------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain selectors       | 22    | Blocking severities, status gating, missing documents, issue counts, sorting, grouping, submission state discriminated union, `canSubmitReview` for every status, version normalization edge cases. |
| Normalization / client | 4     | Contract validation, coercion of loose types, issue ID deduplication, `ReviewContractError` on invalid data.                                                                                        |
| ReviewPageContainer    | 14    | Loading state, error with retry, success rendering, stored mock review loading by route id.                                                                                                         |
| ReviewPageView         | 12    | Layout composition, metadata rendering, grouped issues, missing-document states.                                                                                                                    |
| ReviewSummary          | 5     | Blocked, ready, missing-document, non-reviewable state copy and severity counts.                                                                                                                    |
| ReviewSubmissionPanel  | 11    | Disabled/enabled button, `aria-describedby` connection, local submit success, all submission states.                                                                                                |
| IssueCard              | 7     | Severity badge, page number, blocking text, description expand/collapse.                                                                                                                            |
| IssueList              | 2     | Rendering with issues, empty state message.                                                                                                                                                         |
| DocumentViewer         | 7     | Iframe rendering, accessible title, fallback link, missing URL state.                                                                                                                               |
| UI primitives          | 5     | Button, ButtonLink, TextLink — semantic HTML and shared style application.                                                                                                                          |
| Formatters             | 3     | Timestamp formatting, status labels, issue count pluralization.                                                                                                                                     |
| App smoke              | 4     | Upload route, mock upload scenario navigation, direct review-id loading, and upload context preservation.                                                                                           |

**Not testable in jsdom:** native PDF search. That remains a manual QA step (see checklist above).

## Known Limitations

- **No backend** — Submit records local state only; no API call. Upload uses a mock client backed by `sessionStorage`.
- **Mock upload persistence** — Reviews created by the upload mock are scoped to the current browser tab/session; shared links to `/review/:reviewId` are not durable until a real backend exists.
- **No processing delay** — The upload page lets reviewers choose the post-analysis state directly instead of waiting through an asynchronous processing screen.
- **No historical versions** — Only the latest uploaded document version is shown.
- **No auth** — No authentication, authorization, or user management.
- **No PDF annotations** — No page linking, annotation editing, or extracted-text search UI.
- **Browser-dependent PDF** — Native PDF rendering behavior varies; manual verification is required in the target environment.

## Production Readiness

This is a take-home implementation scoped to the challenge requirements. Before production, I would add:

- **Runtime schema validation** — Zod or a lightweight parser once the real API contract is finalized. The normalization layer is already structured for this upgrade.
- **API client and error handling** — Real submit mutation, retry logic, and a structured error taxonomy.
- **Browser matrix testing** — Verify native PDF search in Chrome, Safari, Firefox, and Edge.
- **E2E tests** — Playwright smoke tests for blocked/ready submit flows and PDF rendering.
- **Accessibility audit** — Automated axe-core in CI plus manual screen reader verification.
- **Observability** — Analytics for blocked submission attempts, successful submissions, and issue filter usage.
- **Upload workflow** — Replace the mock upload client with the actual re-upload mutation, processing state transitions, durable review ids, and version history.

## AI Disclosure

AI tools (Windsurf with Claude) were used to accelerate implementation scaffolding, generate test boilerplate, review code for requirement drift, and draft documentation. All AI-generated code was reviewed, edited, and validated before inclusion.

**Human-owned decisions:** product interpretation, domain model design, business rule centralization, dependency choices (and rejections), architecture boundaries, UX copy, PDF viewer tradeoff, and the final quality bar. AI was used as an accelerator, not as a substitute for engineering judgment.

## Tech Stack

| Dependency            | Version      | Purpose                         |
| --------------------- | ------------ | ------------------------------- |
| React                 | 19.2         | UI framework                    |
| React Router DOM      | 7.15         | Client-side routing             |
| TypeScript            | 6.0 (strict) | Type safety, zero `any`         |
| Vite                  | 8.0          | Dev server and production build |
| Tailwind CSS          | 4.1          | Utility-first styling           |
| lucide-react          | 1.14         | Focused SVG icon set            |
| Vitest                | 4.1          | Test runner                     |
| React Testing Library | 16.3         | Component testing by behavior   |
| jsdom                 | 29.1         | Test DOM environment            |

Runtime dependencies are limited to React, ReactDOM, React Router DOM, and lucide-react for accessible SVG icons. All other packages are devDependencies.
