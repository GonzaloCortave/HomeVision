import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const buttonVariantClassNames: Record<ButtonVariant, string> = {
  primary:
    'bg-slate-950 text-white hover:bg-slate-800 focus-visible:outline-sky-600',
  secondary:
    'border border-slate-300 bg-white text-slate-800 shadow-sm hover:border-sky-300 hover:text-sky-800 focus-visible:outline-sky-600',
}

const Button = ({
  className,
  type = 'button',
  variant = 'primary',
  ...buttonProps
}: ButtonProps) => {
  const classNames = [
    'rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    buttonVariantClassNames[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <button className={classNames} type={type} {...buttonProps} />
}

export default Button
