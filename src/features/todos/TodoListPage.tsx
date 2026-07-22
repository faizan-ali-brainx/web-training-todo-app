import { useEffect } from 'react';
import './todos.css';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { FormError } from '../../components/FormError';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser } from '../auth/authSlice';
import { fetchTodos, selectTodos, selectTodosError, selectTodosStatus } from './todosSlice';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';
import type { Todo } from '../../types';

function TodoListHeader({ userName, onLogout }: { userName: string | undefined; onLogout: () => void }) {
  return (
    <header className="todos_header">
      <h1>Todo List</h1>
      <div>
        <span className="todos_user">{userName}</span>
        <Button variant="secondary" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

interface TodoListBodyProps {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  todos: Todo[];
}

function TodoListBody({ status, error, todos }: TodoListBodyProps) {
  if (status === 'loading') return <Spinner />;
  if (status === 'failed') return <FormError message={error} />;
  if (todos.length === 0) return <p>No todos yet — add one above.</p>;

  return (
    <ul className="todo_list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

export function TodoListPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const todos = useAppSelector(selectTodos);
  const status = useAppSelector(selectTodosStatus);
  const error = useAppSelector(selectTodosError);

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  return (
    <section className="todos_page">
      <TodoListHeader userName={user?.name} onLogout={() => dispatch(logout())} />
      <TodoForm />
      <TodoListBody status={status} error={error} todos={todos} />
    </section>
  );
}
