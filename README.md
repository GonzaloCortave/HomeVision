# HomeVision Review Page

Single-page document review UI for HomeVision's AI-assisted collateral review workflow. Built with React 19, TypeScript 6 (strict), Vite 8, and Tailwind CSS 4.

HomeVision's MIRA platform automates collateral reviews for mortgage lending. Operational reviewers process high volumes of documents daily and need to quickly identify whether a review is blocked, understand what must be fixed in the source document, and submit only when blocking issues are resolved. This page is built for that workflow — fast exception triage, not decorative UI.

**Core rule:** `critical` and `major` issues block submission. `minor` issues do not.

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
```

All five commands pass cleanly at time of submission.

## What Was Built

The primary user is a collateral reviewer who must inspect a PDF, understand AI-detected issues, and submit only when blocking issues are resolved.

| Area               | Description                                                                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Review header**  | File name, status badge, version, upload timestamp (`<time>` with `dateTime`), reviewer name and email.                                                                                                                |
| **PDF viewer**     | Native `<iframe>` with accessible title. Supports Chrome Cmd+F / Ctrl+F search from the Review Page, plus an "Open searchable PDF in new tab" link for isolated PDF search when exact PDF-only results matter.         |
| **Review summary** | Severity counts (critical / major / minor), blocked / ready / missing-document / non-reviewable state with operational copy explaining what to fix and where.                                                          |
| **Issue list**     | Issues grouped by severity in a three-column grid, sorted by page within each group. Each card shows severity badge, page number, title, expand/collapse for long descriptions, and blocking impact text.              |
| **Submit panel**   | Disabled when blocked or non-reviewable. Enabled only when `on_review` + zero blocking issues + document URL present. Records local success state on click. `aria-describedby` connects the helper text to the button. |
| **Mobile layout**  | Stacked layout with Document / Issues anchor links visible in the first viewport for quick navigation.                                                                                                                 |
| **Edge states**    | Loading with status announcement, error with retry, missing PDF, no issues, minor-only, and local submitted confirmation — all covered by component tests.                                                             |

## Assumptions And Missing Assets

The challenge references `review_mock.json` and `example_document.pdf`, but neither file was available. Rather than guess silently, I documented the gap and built explicit fallbacks.

- **Mock data** — `src/features/review/data/reviewMock.ts` provides 12 fixture variants (blocked, minor-only, no-issues, created, processing, submitted, missing-document, and combinations). Each variant is used in tests.
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
5. **No in-app resolve** — Blocking issues are fixed by correcting the source document and uploading a new version. The app does not invent a resolve action because that workflow is not supported by the product contract.
6. **Submission state machine** — `getSubmissionState()` returns a discriminated union (`not_reviewable | blocked | missing_document | ready`) so components pattern-match on state rather than recomputing eligibility.

## Architecture

29 source files, 14 test files (2,075 lines of tests).

```
src/
  app/                          App entry and composition root
  features/review/
    domain/                     Types, normalizeReview(), pure selectors
    data/                       Async mock client + 12 fixture variants
    hooks/                      useReviewLoader (loading/error/success)
    components/                 ReviewHeader, ReviewSummary, IssuePanel,
                                IssueList, IssueCard, SubmitPanel,
                                ReviewSectionNav, ReviewLoadStates, etc.
    utils/                      Formatting helpers (timestamps, status, counts)
    ReviewPageContainer.tsx     Data-loading boundary (fetches + state)
    ReviewPageView.tsx          Pure layout composition (props only)
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

**91 tests** across 14 suites, **2,075 lines** of test code. All behavioral, no snapshots, no Tailwind class assertions.

| Suite                  | Tests | What it covers                                                                                                                                                    |
| ---------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain selectors       | 21    | Blocking severities, status gating, missing documents, issue counts, sorting, grouping, submission state discriminated union, `canSubmitReview` for every status. |
| Normalization / client | 4     | Contract validation, coercion of loose types, issue ID deduplication, `ReviewContractError` on invalid data.                                                      |
| ReviewPageContainer    | 13    | Loading state, error with retry, success rendering, all 12 fixture variants.                                                                                      |
| ReviewPageView         | 12    | Layout composition, metadata rendering, grouped issues, missing-document states.                                                                                  |
| ReviewSummary          | 5     | Blocked, ready, missing-document, non-reviewable state copy and severity counts.                                                                                  |
| ReviewSubmissionPanel  | 11    | Disabled/enabled button, `aria-describedby` connection, local submit success, all submission states.                                                              |
| IssueCard              | 7     | Severity badge, page number, blocking text, description expand/collapse.                                                                                          |
| IssueList              | 2     | Rendering with issues, empty state message.                                                                                                                       |
| DocumentViewer         | 7     | Iframe rendering, accessible title, fallback link, missing URL state.                                                                                             |
| UI primitives          | 5     | Button, ButtonLink, TextLink — semantic HTML and shared style application.                                                                                        |
| Formatters             | 3     | Timestamp formatting, status labels, issue count pluralization.                                                                                                   |
| App smoke              | 1     | Full app renders with default mock data.                                                                                                                          |

**Not testable in jsdom:** native PDF search. That remains a manual QA step (see checklist above).

## Known Limitations

- **No backend** — Submit records local state only; no API call.
- **Single page** — No upload, processing, or submitted pages.
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
- **Upload workflow** — Support for re-upload, processing state transitions, and version history.

## AI Disclosure

AI tools (Windsurf with Claude) were used to accelerate implementation scaffolding, generate test boilerplate, review code for requirement drift, and draft documentation. All AI-generated code was reviewed, edited, and validated before inclusion.

**Human-owned decisions:** product interpretation, domain model design, business rule centralization, dependency choices (and rejections), architecture boundaries, UX copy, PDF viewer tradeoff, and the final quality bar. AI was used as an accelerator, not as a substitute for engineering judgment.

## Tech Stack

| Dependency            | Version      | Purpose                         |
| --------------------- | ------------ | ------------------------------- |
| React                 | 19.2         | UI framework                    |
| TypeScript            | 6.0 (strict) | Type safety, zero `any`         |
| Vite                  | 8.0          | Dev server and production build |
| Tailwind CSS          | 4.1          | Utility-first styling           |
| lucide-react          | 1.14         | Focused SVG icon set            |
| Vitest                | 4.1          | Test runner                     |
| React Testing Library | 16.3         | Component testing by behavior   |
| jsdom                 | 29.1         | Test DOM environment            |

Runtime dependencies are limited to React, ReactDOM, and lucide-react for accessible SVG icons. All other packages are devDependencies.
