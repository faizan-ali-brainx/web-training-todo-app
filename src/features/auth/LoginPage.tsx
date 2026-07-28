import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import styles from './LoginPage.module.scss';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { TextField } from '../../components/TextField';
import { useAppDispatch } from '../../app/hooks';
import { ROUTES } from '../../routes/routes.constants';
import { showToast } from '../toast/toastSlice';
import { login } from './authSlice';
import { loginSchema, type LoginFormValues } from './schemas';
import { useAuthForm } from './useAuthForm';

interface LoginFormFieldsProps {
  register: UseFormRegister<LoginFormValues>;
  errors: FieldErrors<LoginFormValues>;
  isSubmitting: boolean;
  onSubmit: () => void;
}

function LoginFormFields({ register, errors, isSubmitting, onSubmit }: LoginFormFieldsProps) {
  return (
    <form onSubmit={onSubmit}>
      <TextField label="Email" type="email" {...register('email')} error={errors.email?.message} />
      <TextField label="Password" type="password" {...register('password')} error={errors.password?.message} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}

function LoginLinks() {
  return (
    <div className="auth_links">
      <Link to={ROUTES.FORGOT_PASSWORD}>Forgot your password?</Link>
      <span>Don't have an account? <Link to={ROUTES.SIGNUP}>Sign up</Link></span>
    </div>
  );
}

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const submitLogin = async (data: LoginFormValues) => {
    await dispatch(login(data)).unwrap();
    dispatch(showToast({ message: 'Welcome back!', variant: 'success' }));
    navigate(ROUTES.TODOS);
  };
  const { register, onSubmit, formError, formState } = useAuthForm(zodResolver(loginSchema), submitLogin);

  return (
    <section className={styles.page}>
      <h1>Login</h1>
      <FormError message={formError} />
      <LoginFormFields
        register={register}
        errors={formState.errors}
        isSubmitting={formState.isSubmitting}
        onSubmit={onSubmit}
      />
      <LoginLinks />
    </section>
  );
}
