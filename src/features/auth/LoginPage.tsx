import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import './auth.css';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { TextField } from '../../components/TextField';
import { useAppDispatch } from '../../app/hooks';
import { login } from './authSlice';
import { loginSchema, type LoginFormValues } from './schemas';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setFormError(null);
    try {
      await dispatch(login(data)).unwrap();
      navigate('/todos');
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  return (
    <section className="auth-page">
      <h1>Login</h1>
      <FormError message={formError} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <TextField
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <div className="auth-links">
        <Link to="/forgot-password">Forgot your password?</Link>
        <span>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </span>
      </div>
    </section>
  );
}
