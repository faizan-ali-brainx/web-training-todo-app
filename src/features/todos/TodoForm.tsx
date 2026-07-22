import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';
import { useAppDispatch } from '../../app/hooks';
import { addTodo } from './todosSlice';
import { todoFormSchema, type TodoFormValues } from './schemas';

export function TodoForm() {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TodoFormValues>({ resolver: zodResolver(todoFormSchema), defaultValues: { title: '' } });

  const onSubmit = async (data: TodoFormValues) => {
    await dispatch(addTodo(data)).unwrap();
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="todo_add_form">
      <input {...register('title')} placeholder="New todo title" className="ui_input" />
      <Button type="submit" disabled={isSubmitting}>
        Add
      </Button>
      {errors.title && <span className="ui_field_error">{errors.title.message}</span>}
    </form>
  );
}
