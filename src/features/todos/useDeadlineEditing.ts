import { useState } from 'react';
import type { AppDispatch } from '../../app/store';
import type { Todo } from '../../types';
import { runWithToast } from '../toast/runWithToast';
import { updateTodo } from './todosSlice';

export interface DeadlineEditing {
  value: string;
  setValue: (value: string) => void;
  save: () => void;
  clear: () => void;
}

// `datetime-local` inputs want a local "YYYY-MM-DDTHH:mm" string, not an ISO
// (UTC) one — convert a stored ISO deadline into that local shape.
function toInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Controller for TodoDeadline: holds the picker's value and dispatches
// owner-only deadline updates (set/clear) with toast feedback. The backend
// validates the date is in the future and re-arms its reminder on change.
export function useDeadlineEditing(dispatch: AppDispatch, todo: Todo): DeadlineEditing {
  const [value, setValue] = useState(toInputValue(todo.deadline));

  const save = () => {
    if (!value) return;
    const deadline = new Date(value).toISOString();
    void runWithToast(
      dispatch,
      () => dispatch(updateTodo({ id: todo.id, dto: { deadline } })).unwrap(),
      'Deadline updated'
    );
  };

  const clear = () => {
    setValue('');
    void runWithToast(
      dispatch,
      () => dispatch(updateTodo({ id: todo.id, dto: { deadline: null } })).unwrap(),
      'Deadline cleared'
    );
  };

  return { value, setValue, save, clear };
}
