import './components.css';

// Renders a form-level error banner, or nothing when there's no message.
export function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return <p className="ui_form_error">{message}</p>;
}
