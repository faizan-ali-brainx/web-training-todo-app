import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import './auth.css';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { TextField } from '../../components/TextField';
import { useAppDispatch } from '../../app/hooks';
import { signup } from './authSlice';
import { signupSchema, type SignupFormValues } from './schemas';

export function SignupPage() {
  const dispatch = useAppDispatch();
  const [formError, setFormError] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupFormValues) => {
    setFormError(null);
    try {
      const result = await dispatch(signup(data)).unwrap();
      setVerificationToken(result.verificationToken);
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  if (verificationToken) {
    return (
      <section className="auth-page">
        <h1>Check your email</h1>
        <p className="auth-success">Account created! Verify your email to log in.</p>
        <p className="auth-mock-note">
          No real email is sent yet (mock API). Click below to simulate opening the verification
          link:
          <br />
          <Link to={`/verify-email?token=${verificationToken}`}>Verify my email</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="auth-page">
      <h1>Sign up</h1>
      <FormError message={formError} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField label="Name" {...register('name')} error={errors.name?.message} />
        <TextField label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <TextField
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
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
      <div className="auth-links">
        <span>
          Already have an account? <Link to="/login">Login</Link>
        </span>
      </div>
    </section>
  );
}
