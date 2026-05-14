import type { AnchorHTMLAttributes } from 'react'

export type TextLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>

const textLinkClassNames =
  'inline-flex items-center gap-1.5 font-medium text-sky-700 underline-offset-4 hover:text-sky-800 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600'

const TextLink = ({ className, ...linkProps }: TextLinkProps) => {
  const classNames = [textLinkClassNames, className].filter(Boolean).join(' ')

  return <a className={classNames} {...linkProps} />
}

export default TextLink
