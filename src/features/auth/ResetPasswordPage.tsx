import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import './auth.css';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { TextField } from '../../components/TextField';
import { useAppDispatch } from '../../app/hooks';
import { resetPassword } from './authSlice';
import { resetPasswordSchema, type ResetPasswordFormValues } from './schemas';
import { useAuthForm } from './useAuthForm';

function MissingTokenNotice() {
  return (
    <section className="auth_page">
      <h1>Reset password</h1>
      <FormError message="Missing or invalid reset link." />
      <div className="auth_links">
        <Link to="/forgot-password">Request a new link</Link>
      </div>
    </section>
  );
}

interface ResetPasswordFormFieldsProps {
  register: UseFormRegister<ResetPasswordFormValues>;
  errors: FieldErrors<ResetPasswordFormValues>;
  isSubmitting: boolean;
  onSubmit: () => void;
}

function ResetPasswordFormFields({ register, errors, isSubmitting, onSubmit }: ResetPasswordFormFieldsProps) {
  return (
    <form onSubmit={onSubmit}>
      <TextField label="New password" type="password" {...register('password')} error={errors.password?.message} />
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
  );
}

function useResetPasswordSubmit(token: string | null) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return async (data: ResetPasswordFormValues) => {
    if (!token) throw new Error('Missing reset token.');
    await dispatch(resetPassword({ token, newPassword: data.password })).unwrap();
    navigate('/login');
  };
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const submitReset = useResetPasswordSubmit(token);
  const { register, onSubmit, formError, formState } = useAuthForm(zodResolver(resetPasswordSchema), submitReset);

  if (!token) return <MissingTokenNotice />;

  return (
    <section className="auth_page">
      <h1>Reset password</h1>
      <FormError message={formError} />
      <ResetPasswordFormFields
        register={register}
        errors={formState.errors}
        isSubmitting={formState.isSubmitting}
        onSubmit={onSubmit}
      />
    </section>
  );
}
