import { useEffect } from 'react';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';
import { FormError } from '../../components/FormError';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser } from '../auth/authSlice';
import { NotificationBell } from '../notifications/NotificationBell';
import { runWithToast } from '../toast/runWithToast';
import { fetchTodos, selectTodos, selectTodosError, selectTodosStatus } from './todosSlice';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';
import type { Todo } from '../../types';
import styles from './TodoListPage.module.scss';

function TodoListHeader({ userName, onLogout }: { userName: string | undefined; onLogout: () => void }) {
  return (
    <header className={styles.header}>
      <h1>Todo List</h1>
      {/* Simple structural flex row — a good fit for a Tailwind utility class
          rather than its own named selector in TodoListPage.module.scss. */}
      <div className="flex items-center gap-3">
        <NotificationBell />
        <span className={styles.user}>{userName}</span>
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
    <ul className={styles.list}>
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
  const handleLogout = () => runWithToast(dispatch, () => dispatch(logout()).unwrap(), 'Logged out');

  return (
    <section className={styles.page}>
      <TodoListHeader userName={user?.name} onLogout={handleLogout} />
      <TodoForm />
      <TodoListBody status={status} error={error} todos={todos} />
    </section>
  );
}
