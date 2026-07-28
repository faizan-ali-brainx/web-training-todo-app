import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.scss';
import { ROUTES } from './routes.constants';

export function NotFoundPage() {
  return (
    <section className={styles.page}>
      <h1>404</h1>
      <p>This page doesn't exist.</p>
      <Link to={ROUTES.HOME}>Back to home</Link>
    </section>
  );
}
