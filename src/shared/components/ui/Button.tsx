import type { ButtonHTMLAttributes } from 'react'
import {
  getButtonClassName,
  getTextButtonClassName,
  type ButtonStyleSize,
  type ButtonStyleVariant,
} from './buttonStyles'

export type ButtonVariant = ButtonStyleVariant | 'text'
export type ButtonSize = ButtonStyleSize

type BaseButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

type StandardButtonProps = BaseButtonProps & {
  size?: ButtonSize
  variant?: ButtonStyleVariant
}

type TextButtonProps = BaseButtonProps & {
  size?: never
  variant: Extract<ButtonVariant, 'text'>
}

export type ButtonProps = StandardButtonProps | TextButtonProps

const Button = ({
  className,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...buttonProps
}: ButtonProps) => {
  const classNames =
    variant === 'text'
      ? getTextButtonClassName(className)
      : getButtonClassName({ className, size, variant })

  return <button className={classNames} type={type} {...buttonProps} />
}

export default Button
