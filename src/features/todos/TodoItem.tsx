import { memo, useState } from 'react';
import { Button } from '../../components/Button';
import { useAppDispatch } from '../../app/hooks';
import type { AppDispatch } from '../../app/store';
import { runWithToast } from '../toast/runWithToast';
import { deleteTodo, updateTodo } from './todosSlice';
import type { Todo } from '../../types';
import styles from './TodoItem.module.scss';

// Toggling `completed` skips the success toast (too frequent/obvious from
// the UI itself); renaming and deleting are deliberate, occasional actions
// so they get one. Every path still toasts on failure — see runWithToast.
function commitTitleEdit(dispatch: AppDispatch, todo: Todo, title: string) {
  const trimmed = title.trim();
  if (!trimmed || trimmed === todo.title) return;
  void runWithToast(
    dispatch,
    () => dispatch(updateTodo({ id: todo.id, dto: { title: trimmed } })).unwrap(),
    'Todo renamed'
  );
}

interface TodoItemProps {
  todo: Todo;
}

interface TodoTitleFieldProps {
  todo: Todo;
  isEditing: boolean;
  title: string;
  onTitleChange: (title: string) => void;
  onSaveEdit: () => void;
  onStartEdit: () => void;
}

function TodoTitleField({ todo, isEditing, title, onTitleChange, onSaveEdit, onStartEdit }: TodoTitleFieldProps) {
  if (isEditing) {
    return (
      <input
        className="ui_input"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        onBlur={onSaveEdit}
        onKeyDown={(e) => e.key === 'Enter' && onSaveEdit()}
        autoFocus
      />
    );
  }

  return (
    <span className={styles.title} onDoubleClick={onStartEdit}>
      {todo.title}
    </span>
  );
}

interface TodoItemActionsProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onDelete: () => void;
}

function TodoItemActions({ isEditing, onToggleEdit, onDelete }: TodoItemActionsProps) {
  return (
    <div className={styles.actions}>
      <Button variant="secondary" type="button" onClick={onToggleEdit}>
        {isEditing ? 'Cancel' : 'Edit'}
      </Button>
      <Button variant="secondary" type="button" onClick={onDelete}>
        Delete
      </Button>
    </div>
  );
}

interface TodoItemViewProps {
  todo: Todo;
  isEditing: boolean;
  title: string;
  onToggleComplete: () => void;
  onTitleChange: (title: string) => void;
  onSaveEdit: () => void;
  onStartEdit: () => void;
  onToggleEdit: () => void;
  onDelete: () => void;
}

// Pure presentational view — all state and dispatching lives in TodoItemImpl below.
function TodoItemView(props: TodoItemViewProps) {
  const { todo, isEditing, title, onToggleComplete, onTitleChange, onSaveEdit, onStartEdit, onToggleEdit, onDelete } =
    props;

  return (
    <li className={`${styles.item}${todo.completed ? ` ${styles.completed}` : ''}`}>
      <input type="checkbox" checked={todo.completed} onChange={onToggleComplete} />
      <TodoTitleField
        todo={todo}
        isEditing={isEditing}
        title={title}
        onTitleChange={onTitleChange}
        onSaveEdit={onSaveEdit}
        onStartEdit={onStartEdit}
      />
      <TodoItemActions isEditing={isEditing} onToggleEdit={onToggleEdit} onDelete={onDelete} />
    </li>
  );
}

// Toggle/delete dispatches wrapped with toast feedback, split out of
// TodoItemImpl so it stays small.
function useTodoMutations(dispatch: AppDispatch, todo: Todo) {
  const toggleComplete = () =>
    runWithToast(dispatch, () =>
      dispatch(updateTodo({ id: todo.id, dto: { completed: !todo.completed } })).unwrap()
    );
  const remove = () => runWithToast(dispatch, () => dispatch(deleteTodo(todo.id)).unwrap(), 'Todo deleted');
  return { toggleComplete, remove };
}

function TodoItemImpl({ todo }: TodoItemProps) {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const { toggleComplete, remove } = useTodoMutations(dispatch, todo);
  const handleSaveEdit = () => {
    commitTitleEdit(dispatch, todo, title);
    setIsEditing(false);
  };
  return (
    <TodoItemView
      todo={todo}
      isEditing={isEditing}
      title={title}
      onToggleComplete={toggleComplete}
      onTitleChange={setTitle}
      onSaveEdit={handleSaveEdit}
      onStartEdit={() => setIsEditing(true)}
      onToggleEdit={() => setIsEditing((v) => !v)}
      onDelete={remove}
    />
  );
}

export const TodoItem = memo(TodoItemImpl);
