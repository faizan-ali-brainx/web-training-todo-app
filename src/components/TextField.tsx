import { forwardRef, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// forwardRef is required so react-hook-form's register() can attach its ref
// directly to the underlying <input>. Composes only the shared `ui_field`/
// `ui_input`/`ui_field_error` global classes (see styles/global.scss) — no
// component-specific styling of its own, so no TextField.module.scss.
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;

    return (
      <div className="ui_field">
        <label htmlFor={inputId}>{label}</label>
        <input ref={ref} id={inputId} className="ui_input" {...rest} />
        {error && <span className="ui_field_error">{error}</span>}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
