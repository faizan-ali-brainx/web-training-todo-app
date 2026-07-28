import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { useAppDispatch } from '../../app/hooks';
import { runWithToast } from '../toast/runWithToast';
import { addTodo } from './todosSlice';
import { todoFormSchema, type TodoFormValues } from './schemas';
import styles from './TodoForm.module.scss';

export function TodoForm() {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TodoFormValues>({ resolver: zodResolver(todoFormSchema), defaultValues: { title: '' } });

  const onSubmit = async (data: TodoFormValues) => {
    await runWithToast(
      dispatch,
      async () => {
        await dispatch(addTodo(data)).unwrap();
        reset();
      },
      'Todo added'
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <input {...register('title')} placeholder="New todo title" className="ui_input" />
      <Button type="submit" disabled={isSubmitting}>
        Add
      </Button>
      {errors.title && <span className="ui_field_error">{errors.title.message}</span>}
    </form>
  );
}
