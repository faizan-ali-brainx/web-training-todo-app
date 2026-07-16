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
    <section className="todos-page">
      <header className="todos-header">
        <h1>Todo List</h1>
        <div>
          <span className="todos-user">{user?.name}</span>
          <Button variant="secondary" onClick={() => dispatch(logout())}>
            Logout
          </Button>
        </div>
      </header>

      <TodoForm />

      {status === 'loading' && <Spinner />}
      {status === 'failed' && <FormError message={error} />}
      {status === 'succeeded' && todos.length === 0 && <p>No todos yet — add one above.</p>}
      {(status === 'succeeded' || todos.length > 0) && (
        <ul className="todo-list">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
    </section>
  );
}
