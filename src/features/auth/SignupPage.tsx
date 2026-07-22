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
import { signup } from './authSlice';
import { signupSchema, type SignupFormValues } from './schemas';
import { useAuthForm } from './useAuthForm';

interface SignupFormFieldsProps {
  register: UseFormRegister<SignupFormValues>;
  errors: FieldErrors<SignupFormValues>;
  isSubmitting: boolean;
  onSubmit: () => void;
}

function SignupFormFields({ register, errors, isSubmitting, onSubmit }: SignupFormFieldsProps) {
  return (
    <form onSubmit={onSubmit}>
      <TextField label="Name" {...register('name')} error={errors.name?.message} />
      <TextField label="Email" type="email" {...register('email')} error={errors.email?.message} />
      <TextField label="Password" type="password" {...register('password')} error={errors.password?.message} />
      <TextField
        label="Confirm password"
        type="password"
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing up...' : 'Sign up'}
      </Button>
    </form>
  );
}

function useSignupSubmit() {
  const dispatch = useAppDispatch();
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const submitSignup = async (data: SignupFormValues) => {
    const result = await dispatch(signup(data)).unwrap();
    setVerificationToken(result.verificationToken);
  };
  return { verificationToken, submitSignup };
}

function SignupLinks() {
  return (
    <div className="auth_links">
      <span>Already have an account? <Link to="/login">Login</Link></span>
    </div>
  );
}

export function SignupPage() {
  const { verificationToken, submitSignup } = useSignupSubmit();
  const { register, onSubmit, formError, formState } = useAuthForm(zodResolver(signupSchema), submitSignup);

  if (verificationToken) {
    const linkTo = `/verify-email?token=${verificationToken}`;
    return <AuthCheckEmailNotice successMessage="Account created! Verify your email to log in." linkTo={linkTo} linkLabel="Verify my email" />;
  }

  return (
    <section className="auth_page">
      <h1>Sign up</h1>
      <FormError message={formError} />
      <SignupFormFields
        register={register}
        errors={formState.errors}
        isSubmitting={formState.isSubmitting}
        onSubmit={onSubmit}
      />
      <SignupLinks />
    </section>
  );
}
