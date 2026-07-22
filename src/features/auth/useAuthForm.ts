import { useState } from 'react';
import { useForm, type DefaultValues, type FieldValues, type Resolver } from 'react-hook-form';

// Shared by every auth form (Login/Signup/Forgot/Reset password): wires up
// react-hook-form, and centralizes the submit-error state so each page
// doesn't repeat its own try/catch + formError boilerplate.
// Callers build the resolver themselves (e.g. zodResolver(schema)) — calling
// zodResolver generically inside this hook runs into Zod/RHF generic-typing
// friction that disappears once T is concrete at the call site.
export function useAuthForm<T extends FieldValues>(
  resolver: Resolver<T>,
  onValid: (data: T) => Promise<void>,
  defaultValues?: DefaultValues<T>
) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<T>({ resolver, defaultValues });

  const onSubmit = form.handleSubmit(async (data) => {
    setFormError(null);
    try {
      await onValid(data);
    } catch (err) {
      setFormError((err as Error).message);
    }
  });

  return { ...form, onSubmit, formError };
}
