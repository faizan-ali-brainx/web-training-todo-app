import { memo, useState } from 'react';
import { Button } from '../../components/Button';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { AppDispatch } from '../../app/store';
import { selectCurrentUser } from '../auth/authSlice';
import { deleteTodo, updateTodo } from './todosSlice';
import { TodoCollaborators } from './TodoCollaborators';
import type { Todo } from '../../types';
import styles from './TodoItem.module.scss';

// Toggling `completed` skips the success toast (too frequent/obvious from
// the UI itself); renaming and deleting are deliberate, occasional actions
// so they get one. Every path still toasts on failure — see runWithToast.
function commitTitleEdit(dispatch: AppDispatch, todo: Todo, title: string) {
  const trimmed = title.trim();
  if (trimmed && trimmed !== todo.title) {
    dispatch(updateTodo({ id: todo.id, dto: { title: trimmed } }));
  }
}

// Inline-edit state for a todo's title, split out of TodoItemImpl so both
// stay small.
function useTitleEditing(dispatch: AppDispatch, todo: Todo) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);

  const onSaveEdit = () => {
    commitTitleEdit(dispatch, todo, title);
    setIsEditing(false);
  };

  return {
    isEditing,
    title,
    onTitleChange: setTitle,
    onSaveEdit,
    onStartEdit: () => setIsEditing(true),
    onToggleEdit: () => setIsEditing((v) => !v),
  };
}

type TitleEditing = ReturnType<typeof useTitleEditing>;

interface TodoTitleInputProps {
  title: string;
  onTitleChange: (title: string) => void;
  onSaveEdit: () => void;
}

function TodoTitleInput({ title, onTitleChange, onSaveEdit }: TodoTitleInputProps) {
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

interface TodoTitleDisplayProps {
  todo: Todo;
  isOwner: boolean;
  onStartEdit: () => void;
}

function TodoTitleDisplay({ todo, isOwner, onStartEdit }: TodoTitleDisplayProps) {
  return (
    <span className="todo_title" onDoubleClick={isOwner ? onStartEdit : undefined}>
      {todo.title}
      {!isOwner && <span className="todo_shared_badge">Shared with you</span>}
    </span>
  );
}

interface TodoTitleFieldProps {
  todo: Todo;
  isOwner: boolean;
  editing: TitleEditing;
}

// Dispatches to the input or the display span depending on edit state.
function TodoTitleField({ todo, isOwner, editing }: TodoTitleFieldProps) {
  if (editing.isEditing) {
    return (
      <TodoTitleInput title={editing.title} onTitleChange={editing.onTitleChange} onSaveEdit={editing.onSaveEdit} />
    );
  }
  return <TodoTitleDisplay todo={todo} isOwner={isOwner} onStartEdit={editing.onStartEdit} />;
}

interface OwnerActionsProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onDelete: () => void;
}

// Rename/delete controls — owner only.
function OwnerActions({ isEditing, onToggleEdit, onDelete }: OwnerActionsProps) {
  return (
    <>
      <Button variant="secondary" type="button" onClick={onToggleEdit}>
        {isEditing ? 'Cancel' : 'Edit'}
      </Button>
      <Button variant="secondary" type="button" onClick={onDelete}>
        Delete
      </Button>
    </>
  );
}

interface TodoItemActionsProps {
  isOwner: boolean;
  isEditing: boolean;
  showCollaborators: boolean;
  onToggleEdit: () => void;
  onToggleCollaborators: () => void;
  onDelete: () => void;
}

function TodoItemActions(props: TodoItemActionsProps) {
  const { isOwner, isEditing, showCollaborators, onToggleEdit, onToggleCollaborators, onDelete } = props;
  return (
    <div className="todo_item_actions">
      <Button variant="secondary" type="button" onClick={onToggleCollaborators}>
        {showCollaborators ? 'Hide sharing' : 'Share'}
      </Button>
      {isOwner && <OwnerActions isEditing={isEditing} onToggleEdit={onToggleEdit} onDelete={onDelete} />}
    </div>
  );
}

interface TodoItemRowProps {
  todo: Todo;
  isOwner: boolean;
  editing: TitleEditing;
  showCollaborators: boolean;
  onToggleCollaborators: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

// Checkbox + title + action buttons — the single-line part of a todo.
function TodoItemRow(props: TodoItemRowProps) {
  const { todo, isOwner, editing, showCollaborators, onToggleCollaborators, onToggleComplete, onDelete } = props;
  return (
    <div className="todo_item_row">
      <input type="checkbox" checked={todo.completed} onChange={onToggleComplete} />
      <TodoTitleField todo={todo} isOwner={isOwner} editing={editing} />
      <TodoItemActions
        isOwner={isOwner}
        isEditing={editing.isEditing}
        showCollaborators={showCollaborators}
        onToggleEdit={editing.onToggleEdit}
        onToggleCollaborators={onToggleCollaborators}
        onDelete={onDelete}
      />
    </div>
  );
}

type TodoItemViewProps = TodoItemRowProps;

// Pure presentational view — all state and dispatching lives in TodoItemImpl below.
function TodoItemView(props: TodoItemViewProps) {
  const { todo, isOwner, showCollaborators } = props;
  return (
    <li className={`todo_item${todo.completed ? ' completed' : ''}`}>
      <TodoItemRow {...props} />
      {showCollaborators && <TodoCollaborators todoId={todo.id} isOwner={isOwner} />}
    </li>
  );
}

interface TodoItemProps {
  todo: Todo;
}

function TodoItemImpl({ todo }: TodoItemProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const isOwner = todo.userId === currentUser?.id;
  const editing = useTitleEditing(dispatch, todo);
  const [showCollaborators, setShowCollaborators] = useState(false);

  return (
    <TodoItemView
      todo={todo}
      isOwner={isOwner}
      editing={editing}
      showCollaborators={showCollaborators}
      onToggleCollaborators={() => setShowCollaborators((v) => !v)}
      onToggleComplete={() => dispatch(updateTodo({ id: todo.id, dto: { completed: !todo.completed } }))}
      onDelete={() => dispatch(deleteTodo(todo.id))}
    />
  );
}

export const TodoItem = memo(TodoItemImpl);
