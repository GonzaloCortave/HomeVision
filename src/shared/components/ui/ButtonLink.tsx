import type { AnchorHTMLAttributes } from 'react'
import {
  getButtonClassName,
  type ButtonStyleSize,
  type ButtonStyleVariant,
} from './buttonStyles'

export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: ButtonStyleSize
  variant?: ButtonStyleVariant
}

const ButtonLink = ({
  className,
  size = 'md',
  variant = 'secondary',
  ...linkProps
}: ButtonLinkProps) => {
  const classNames = getButtonClassName({
    className: ['text-center', className].filter(Boolean).join(' '),
    size,
    variant,
  })

  return <a className={classNames} {...linkProps} />
}

export default ButtonLink
