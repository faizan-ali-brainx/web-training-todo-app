import styles from './FormError.module.scss';

// Renders a form-level error banner, or nothing when there's no message.
export function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return <p className={styles.error}>{message}</p>;
}
