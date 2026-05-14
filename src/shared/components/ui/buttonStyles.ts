export type ButtonStyleVariant = 'primary' | 'secondary'
export type ButtonStyleSize = 'sm' | 'md' | 'lg'

export type ButtonClassNameOptions = {
  className?: string
  size?: ButtonStyleSize
  variant?: ButtonStyleVariant
}

const buttonBaseClassNames =
  'inline-flex items-center justify-center gap-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:opacity-50'

const buttonVariantClassNames: Record<ButtonStyleVariant, string> = {
  primary: 'bg-slate-950 text-white hover:bg-slate-800',
  secondary:
    'border border-slate-300 bg-white text-sky-700 shadow-sm hover:border-sky-300 hover:text-sky-800',
}

const buttonSizeClassNames: Record<ButtonStyleSize, string> = {
  sm: 'rounded-lg px-3 py-2 text-sm',
  md: 'rounded-lg px-4 py-2 text-sm',
  lg: 'rounded-lg px-4 py-3 text-sm',
}

const textButtonClassNames =
  'inline-flex items-center justify-center gap-1 rounded-sm bg-transparent p-0 text-xs font-semibold text-sky-700 hover:text-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:opacity-50'

export const getButtonClassName = ({
  className,
  size = 'md',
  variant = 'primary',
}: ButtonClassNameOptions = {}) =>
  [
    buttonBaseClassNames,
    buttonVariantClassNames[variant],
    buttonSizeClassNames[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

export const getTextButtonClassName = (className?: string) =>
  [textButtonClassNames, className].filter(Boolean).join(' ')
