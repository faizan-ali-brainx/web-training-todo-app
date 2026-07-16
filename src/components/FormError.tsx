import './components.css';

export function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return <p className="ui-form-error">{message}</p>;
}
