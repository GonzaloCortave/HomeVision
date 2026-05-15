import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileQuestion,
  FileSearch,
  FileText,
  ShieldAlert,
  UploadCloud,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../shared/components/ui/Button'
import type { ReviewMockVariant } from '../review/data/reviewMock'
import { mockUploadDocument } from './data/uploadClient'

type UploadMockScenario = {
  readonly ButtonIcon: LucideIcon
  readonly Icon: LucideIcon
  readonly description: string
  readonly iconClassName: string
  readonly statusLabel: string
  readonly title: string
  readonly variant: ReviewMockVariant
}

type UploadContext = {
  readonly currentVersion: string | null
  readonly documentName: string | null
  readonly nextVersion: string | null
}

const uploadMockScenarios: readonly UploadMockScenario[] = [
  {
    ButtonIcon: Clock3,
    Icon: UploadCloud,
    description: 'Newly created upload before document analysis has started.',
    iconClassName: 'border-slate-200 text-slate-700',
    statusLabel: 'created',
    title: 'Created review',
    variant: 'created',
  },
  {
    ButtonIcon: FileSearch,
    Icon: FileSearch,
    description:
      'Document analysis is still in progress and cannot be submitted yet.',
    iconClassName: 'border-amber-200 text-amber-700',
    statusLabel: 'processing',
    title: 'Processing review',
    variant: 'processing',
  },
  {
    ButtonIcon: ShieldAlert,
    Icon: ShieldAlert,
    description:
      'On-review document with critical and major issues that block submission.',
    iconClassName: 'border-red-200 text-red-700',
    statusLabel: 'on_review',
    title: 'Blocked review',
    variant: 'blocked',
  },
  {
    ButtonIcon: AlertTriangle,
    Icon: AlertTriangle,
    description:
      'On-review document where only minor, non-blocking issues remain.',
    iconClassName: 'border-orange-200 text-orange-700',
    statusLabel: 'on_review',
    title: 'Minor issues only',
    variant: 'minorOnly',
  },
  {
    ButtonIcon: CheckCircle2,
    Icon: CheckCircle2,
    description:
      'On-review document with no detected issues and a ready submit state.',
    iconClassName: 'border-emerald-200 text-emerald-700',
    statusLabel: 'on_review',
    title: 'Clean review',
    variant: 'noIssues',
  },
  {
    ButtonIcon: CheckCircle2,
    Icon: FileText,
    description: 'Completed review that has already been submitted.',
    iconClassName: 'border-indigo-200 text-indigo-700',
    statusLabel: 'submitted',
    title: 'Submitted review',
    variant: 'submitted',
  },
  {
    ButtonIcon: FileQuestion,
    Icon: FileQuestion,
    description:
      'Review where the uploaded PDF is missing from the review payload.',
    iconClassName: 'border-rose-200 text-rose-700',
    statusLabel: 'missing document',
    title: 'Missing document',
    variant: 'missingDocument',
  },
  {
    ButtonIcon: ShieldAlert,
    Icon: FileQuestion,
    description:
      'Missing document plus blocking issues so the reviewer sees both failure states.',
    iconClassName: 'border-red-200 text-red-700',
    statusLabel: 'missing document',
    title: 'Missing document with blockers',
    variant: 'missingDocumentWithBlockingIssues',
  },
] as const

const UploadDocumentPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const uploadContext = getUploadContext(searchParams)
  const uploadStepValue = uploadContext.nextVersion
    ? `Version ${uploadContext.nextVersion}`
    : 'Document received'
  const handleSelectMockScenario = async (scenario: UploadMockScenario) => {
    const { reviewId } = await mockUploadDocument({
      documentName: uploadContext.documentName ?? undefined,
      variant: scenario.variant,
      version: getUploadVersion(uploadContext.nextVersion),
    })

    navigate(`/review/${reviewId}`)
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-sky-700">
              HomeVision intake
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">
              Upload document
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Choose a demo review outcome. Each path simulates upload,
              analysis, and navigation into the review page.
            </p>
            {uploadContext.documentName ? (
              <p className="mt-2 text-sm font-medium text-slate-700">
                {uploadContext.documentName}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-3 lg:min-w-[28rem]">
            <MockStep label="Upload" value={uploadStepValue} />
            <MockStep label="Analyze" value="Mock state applied" />
            <MockStep label="Review" value="Reviewer redirected" />
          </div>
        </header>

        <section
          aria-label="Upload document mock states"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {uploadMockScenarios.map((scenario) => (
            <MockScenarioCard
              key={scenario.variant}
              onSelectScenario={handleSelectMockScenario}
              scenario={scenario}
            />
          ))}
        </section>
      </div>
    </main>
  )
}

const MockStep = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  )
}

const MockScenarioCard = ({
  onSelectScenario,
  scenario,
}: {
  onSelectScenario: (scenario: UploadMockScenario) => void
  scenario: UploadMockScenario
}) => {
  return (
    <article className="flex min-h-72 flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-3">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg border bg-slate-50 ${scenario.iconClassName}`}
          >
            <scenario.Icon
              aria-hidden="true"
              className="size-5"
              strokeWidth={2}
            />
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {scenario.statusLabel}
          </span>
        </div>
        <h2 className="mt-4 text-base font-semibold text-slate-950">
          {scenario.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {scenario.description}
        </p>
      </div>
      <Button
        aria-label={`Create ${scenario.title} and open review page`}
        className="mt-5 w-full"
        onClick={() => {
          onSelectScenario(scenario)
        }}
      >
        <scenario.ButtonIcon
          aria-hidden="true"
          className="size-4"
          strokeWidth={2}
        />
        Open review
      </Button>
    </article>
  )
}

const getUploadContext = (searchParams: URLSearchParams): UploadContext => {
  return {
    currentVersion: getSearchParamValue(searchParams, 'currentVersion'),
    documentName: getSearchParamValue(searchParams, 'documentName'),
    nextVersion: getSearchParamValue(searchParams, 'nextVersion'),
  }
}

const getSearchParamValue = (
  searchParams: URLSearchParams,
  key: string,
): string | null => {
  const value = searchParams.get(key)?.trim()

  return value && value.length > 0 ? value : null
}

const getUploadVersion = (version: string | null): number | undefined => {
  if (version === null) {
    return undefined
  }

  const versionNumber = Number(version)

  return Number.isInteger(versionNumber) && versionNumber > 0
    ? versionNumber
    : undefined
}

export default UploadDocumentPage
