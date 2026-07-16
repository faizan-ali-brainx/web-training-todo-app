import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './auth.css';
import { Spinner } from '../../components/Spinner';
import { FormError } from '../../components/FormError';
import { useAppDispatch } from '../../app/hooks';
import { verifyEmail } from './authSlice';

type VerifyStatus = 'verifying' | 'success' | 'error';

const MISSING_TOKEN_MESSAGE = 'Missing verification token.';

export function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Derive the missing-token case directly from render instead of setting
  // state inside the effect for it — the effect only needs to run the actual
  // async verification when a token is present.
  const [status, setStatus] = useState<VerifyStatus>(token ? 'verifying' : 'error');
  const [error, setError] = useState<string | null>(token ? null : MISSING_TOKEN_MESSAGE);

  // verifyEmail consumes a one-time token server-side, so it isn't safe to
  // call twice — guard against StrictMode's dev-only double effect-invocation
  // the same way React's docs recommend for non-idempotent side effects.
  const hasRun = useRef(false);

  useEffect(() => {
    if (!token || hasRun.current) return;
    hasRun.current = true;

    dispatch(verifyEmail(token))
      .unwrap()
      .then(() => setStatus('success'))
      .catch((err: Error) => {
        setStatus('error');
        setError(err.message);
      });
  }, [dispatch, token]);

  return (
    <section className="auth-page">
      <h1>Email Verification</h1>
      {status === 'verifying' && <Spinner />}
      {status === 'success' && (
        <>
          <p className="auth-success">Your email has been verified.</p>
          <div className="auth-links">
            <Link to="/login">Continue to login</Link>
          </div>
        </>
      )}
      {status === 'error' && (
        <>
          <FormError message={error} />
          <div className="auth-links">
            <Link to="/signup">Back to sign up</Link>
          </div>
        </>
      )}
    </section>
  );
}
