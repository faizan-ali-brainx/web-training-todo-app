import { Link } from 'react-router-dom';
import './not_found_page.css';

export function NotFoundPage() {
  return (
    <section className="not_found_page">
      <h1>404</h1>
      <p>This page doesn't exist.</p>
      <Link to="/">Back to home</Link>
    </section>
  );
}
