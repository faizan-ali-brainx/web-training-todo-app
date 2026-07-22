import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import './auth.css';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { TextField } from '../../components/TextField';
import { useAppDispatch } from '../../app/hooks';
import { AuthCheckEmailNotice } from './AuthCheckEmailNotice';
import { forgotPassword } from './authSlice';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from './schemas';
import { useAuthForm } from './useAuthForm';

interface ForgotPasswordFormFieldsProps {
  register: UseFormRegister<ForgotPasswordFormValues>;
  errors: FieldErrors<ForgotPasswordFormValues>;
  isSubmitting: boolean;
  onSubmit: () => void;
}

function ForgotPasswordFormFields({ register, errors, isSubmitting, onSubmit }: ForgotPasswordFormFieldsProps) {
  return (
    <form onSubmit={onSubmit}>
      <TextField label="Email" type="email" {...register('email')} error={errors.email?.message} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send reset link'}
      </Button>
    </form>
  );
}

function useForgotPasswordSubmit() {
  const dispatch = useAppDispatch();
  const [resetToken, setResetToken] = useState<string | null>(null);
  const submitForgotPassword = async (data: ForgotPasswordFormValues) => {
    const result = await dispatch(forgotPassword(data.email)).unwrap();
    setResetToken(result.resetToken);
  };
  return { resetToken, submitForgotPassword };
}

function ForgotPasswordLinks() {
  return (
    <div className="auth_links">
      <Link to="/login">Back to login</Link>
    </div>
  );
}

export function ForgotPasswordPage() {
  const { resetToken, submitForgotPassword } = useForgotPasswordSubmit();
  const { register, onSubmit, formError, formState } = useAuthForm(zodResolver(forgotPasswordSchema), submitForgotPassword);

  if (resetToken) {
    const linkTo = `/reset-password?token=${resetToken}`;
    return <AuthCheckEmailNotice successMessage="A password reset link would be sent to your email." linkTo={linkTo} linkLabel="Reset my password" />;
  }

  return (
    <section className="auth_page">
      <h1>Forgot password</h1>
      <FormError message={formError} />
      <ForgotPasswordFormFields
        register={register}
        errors={formState.errors}
        isSubmitting={formState.isSubmitting}
        onSubmit={onSubmit}
      />
      <ForgotPasswordLinks />
    </section>
  );
}
