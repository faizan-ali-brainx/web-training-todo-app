import { Button } from '../../components/Button';
import { useAppDispatch } from '../../app/hooks';
import type { Todo } from '../../types';
import { useDeadlineEditing, type DeadlineEditing } from './useDeadlineEditing';
import styles from './TodoDeadline.module.scss';

// Read-only deadline label. `new Date(deadline)` takes an argument so it's
// deterministic (safe during render); we deliberately don't compare against
// the current clock here, since reading "now" during render isn't pure.
function DeadlineText({ deadline }: { deadline: string | null }) {
  if (!deadline) return <span className={styles.none}>No deadline</span>;
  return <span className={styles.due}>Due {new Date(deadline).toLocaleString()}</span>;
}

interface DeadlineControlsProps extends DeadlineEditing {
  canClear: boolean;
}

// Owner-only picker: a datetime-local input plus Set / Clear actions.
function DeadlineControls({ value, setValue, save, clear, canClear }: DeadlineControlsProps) {
  return (
    <div className={styles.controls}>
      <input
        type="datetime-local"
        className="ui_input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button variant="secondary" type="button" onClick={save} disabled={!value}>
        Set
      </Button>
      {canClear && (
        <Button variant="secondary" type="button" onClick={clear}>
          Clear
        </Button>
      )}
    </div>
  );
}

interface TodoDeadlineProps {
  todo: Todo;
  isOwner: boolean;
}

// Shows a todo's deadline; owners also get a picker to set or clear it
// (deadline edits are owner-only, matching the backend's access rules).
export function TodoDeadline({ todo, isOwner }: TodoDeadlineProps) {
  const dispatch = useAppDispatch();
  const editing = useDeadlineEditing(dispatch, todo);

  return (
    <div className={styles.deadline}>
      <DeadlineText deadline={todo.deadline} />
      {isOwner && <DeadlineControls {...editing} canClear={todo.deadline !== null} />}
    </div>
  );
}
