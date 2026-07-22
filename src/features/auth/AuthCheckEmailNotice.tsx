import { Link } from 'react-router-dom';

interface AuthCheckEmailNoticeProps {
  successMessage: string;
  linkTo: string;
  linkLabel: string;
}

// Shared "check your email" view used by Signup and Forgot Password — both
// simulate an email link on-screen since there's no real mail server yet.
export function AuthCheckEmailNotice({ successMessage, linkTo, linkLabel }: AuthCheckEmailNoticeProps) {
  return (
    <section className="auth_page">
      <h1>Check your email</h1>
      <p className="auth_success">{successMessage}</p>
      <p className="auth_mock_note">
        No real email is sent yet (mock API). Click below to simulate opening the link:
        <br />
        <Link to={linkTo}>{linkLabel}</Link>
      </p>
    </section>
  );
}
