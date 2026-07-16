import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './auth.css';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { TextField } from '../../components/TextField';
import { useAppDispatch } from '../../app/hooks';
import { resetPassword } from './authSlice';
import { resetPasswordSchema, type ResetPasswordFormValues } from './schemas';

export function ResetPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setFormError('Missing reset token.');
      return;
    }
    setFormError(null);
    try {
      await dispatch(resetPassword({ token, newPassword: data.password })).unwrap();
      navigate('/login');
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  if (!token) {
    return (
      <section className="auth-page">
        <h1>Reset password</h1>
        <FormError message="Missing or invalid reset link." />
        <div className="auth-links">
          <Link to="/forgot-password">Request a new link</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-page">
      <h1>Reset password</h1>
      <FormError message={formError} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="New password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        <TextField
          label="Confirm new password"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>
    </section>
  );
}
