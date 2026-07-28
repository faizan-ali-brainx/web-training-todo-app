import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styles from './VerifyEmailPage.module.scss';
import { Spinner } from '../../components/Spinner';
import { FormError } from '../../components/FormError';
import { useAppDispatch } from '../../app/hooks';
import { ROUTES } from '../../routes/routes.constants';
import { verifyEmail } from './authSlice';

type VerifyStatus = 'verifying' | 'success' | 'error';

const MISSING_TOKEN_MESSAGE = 'Missing verification token.';

function VerifyEmailResult({ status, error }: { status: VerifyStatus; error: string | null }) {
  if (status === 'verifying') return <Spinner />;

  if (status === 'success') {
    return (
      <>
        <p className="auth_success">Your email has been verified.</p>
        <div className="auth_links">
          <Link to={ROUTES.LOGIN}>Continue to login</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <FormError message={error} />
      <div className="auth_links">
        <Link to={ROUTES.SIGNUP}>Back to sign up</Link>
      </div>
    </>
  );
}

// verifyEmail consumes a one-time token server-side, so it isn't safe to call
// twice — guarded with a ref against StrictMode's dev-only double effect-invocation,
// the same way React's docs recommend for non-idempotent side effects.
function useVerifyOnMount(token: string | null) {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<VerifyStatus>(token ? 'verifying' : 'error');
  const [error, setError] = useState<string | null>(token ? null : MISSING_TOKEN_MESSAGE);
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

  return { status, error };
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { status, error } = useVerifyOnMount(searchParams.get('token'));

  return (
    <section className={styles.page}>
      <h1>Email Verification</h1>
      <VerifyEmailResult status={status} error={error} />
    </section>
  );
}
