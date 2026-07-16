import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import './auth.css';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { TextField } from '../../components/TextField';
import { useAppDispatch } from '../../app/hooks';
import { forgotPassword } from './authSlice';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from './schemas';

export function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const [formError, setFormError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setFormError(null);
    try {
      const result = await dispatch(forgotPassword(data.email)).unwrap();
      setResetToken(result.resetToken);
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  if (resetToken) {
    return (
      <section className="auth-page">
        <h1>Check your email</h1>
        <p className="auth-success">A password reset link would be sent to your email.</p>
        <p className="auth-mock-note">
          No real email is sent yet (mock API). Click below to simulate opening the reset link:
          <br />
          <Link to={`/reset-password?token=${resetToken}`}>Reset my password</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="auth-page">
      <h1>Forgot password</h1>
      <FormError message={formError} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>
      <div className="auth-links">
        <Link to="/login">Back to login</Link>
      </div>
    </section>
  );
}
