import { memo, useState } from 'react';
import { Button } from '../../components/Button';
import { useAppDispatch } from '../../app/hooks';
import { deleteTodo, updateTodo } from './todosSlice';
import type { Todo } from '../../types';

interface TodoItemProps {
  todo: Todo;
}

function TodoItemImpl({ todo }: TodoItemProps) {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);

  const handleToggle = () => {
    dispatch(updateTodo({ id: todo.id, dto: { completed: !todo.completed } }));
  };

  const handleDelete = () => {
    dispatch(deleteTodo(todo.id));
  };

  const handleSaveEdit = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== todo.title) {
      dispatch(updateTodo({ id: todo.id, dto: { title: trimmed } }));
    }
    setIsEditing(false);
  };

  return (
    <li className={`todo-item${todo.completed ? ' completed' : ''}`}>
      <input type="checkbox" checked={todo.completed} onChange={handleToggle} />

      {isEditing ? (
        <input
          className="ui-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
          autoFocus
        />
      ) : (
        <span className="todo-title" onDoubleClick={() => setIsEditing(true)}>
          {todo.title}
        </span>
      )}

      <div className="todo-item-actions">
        <Button variant="secondary" type="button" onClick={() => setIsEditing((v) => !v)}>
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
        <Button variant="secondary" type="button" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </li>
  );
}

export const TodoItem = memo(TodoItemImpl);
