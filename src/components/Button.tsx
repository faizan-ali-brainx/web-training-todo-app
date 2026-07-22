import type { ButtonHTMLAttributes } from 'react';
import './components.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

// Shared button used across every feature; pass any native <button> prop through.
export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  return <button className={`ui_button ui_button_${variant} ${className ?? ''}`} {...rest} />;
}
