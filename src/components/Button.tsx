import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

// Shared button used across every feature; pass any native <button> prop through.
export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  return <button className={`${styles.button} ${styles[variant]} ${className ?? ''}`} {...rest} />;
}
