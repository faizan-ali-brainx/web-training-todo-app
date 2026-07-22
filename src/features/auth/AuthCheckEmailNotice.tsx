import { Link } from 'react-router-dom';

interface AuthCheckEmailNoticeProps {
  successMessage: string;
  linkTo?: string; // only present in the mock API or the real backend's non-production mode
  linkLabel: string;
}

// Shared "check your email" view used by Signup and Forgot Password. When a
// linkTo is available (mock API, or the real backend outside production) it
// shows a clickable dev shortcut instead of requiring a real inbox.
export function AuthCheckEmailNotice({ successMessage, linkTo, linkLabel }: AuthCheckEmailNoticeProps) {
  return (
    <section className="auth_page">
      <h1>Check your email</h1>
      <p className="auth_success">{successMessage}</p>
      {linkTo && (
        <p className="auth_mock_note">
          Dev shortcut — no need to check a real inbox right now:
          <br />
          <Link to={linkTo}>{linkLabel}</Link>
        </p>
      )}
    </section>
  );
}
