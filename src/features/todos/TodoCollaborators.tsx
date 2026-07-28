import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { Spinner } from '../../components/Spinner';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchCollaborators,
  inviteCollaborator,
  removeCollaborator,
  selectCollaboratorsForTodo,
} from './collaboratorsSlice';
import type { Collaborator } from '../../types';
import styles from './TodoCollaborators.module.scss';

// Owner-only invite form's state/submit logic, split out so InviteForm below
// stays pure JSX.
function useInviteForm(todoId: number) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await dispatch(inviteCollaborator({ todoId, email })).unwrap();
      setEmail('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { email, setEmail, error, isSubmitting, onSubmit };
}

interface InviteFormProps {
  todoId: number;
}

// Owner-only: invites a collaborator by email. Kept separate from the list so
// its own submit error doesn't get confused with the list's fetch error.
function InviteForm({ todoId }: InviteFormProps) {
  const { email, setEmail, error, isSubmitting, onSubmit } = useInviteForm(todoId);

  return (
    <form onSubmit={onSubmit} className={styles.inviteForm}>
      <input
        type="email"
        className="ui_input"
        placeholder="Invite by email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        Invite
      </Button>
      <FormError message={error} />
    </form>
  );
}

interface CollaboratorRowProps {
  collaborator: Collaborator;
  todoId: number;
  isOwner: boolean;
}

// One collaborator, with an owner-only Remove button.
function CollaboratorRow({ collaborator, todoId, isOwner }: CollaboratorRowProps) {
  const dispatch = useAppDispatch();

  return (
    <li className={styles.row}>
      <span>
        {collaborator.name} <span className={styles.email}>({collaborator.email})</span>
      </span>
      {isOwner && (
        <Button
          variant="secondary"
          type="button"
          onClick={() => dispatch(removeCollaborator({ todoId, userId: collaborator.id }))}
        >
          Remove
        </Button>
      )}
    </li>
  );
}

interface CollaboratorsStatusProps {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isEmpty: boolean;
}

// Loading/error/empty messaging for the collaborators list — nothing renders
// once there's at least one collaborator to show instead.
function CollaboratorsStatus({ status, error, isEmpty }: CollaboratorsStatusProps) {
  if (status === 'loading') return <Spinner />;
  if (status === 'failed') return <FormError message={error} />;
  if (status === 'succeeded' && isEmpty) return <p className={styles.empty}>No collaborators yet.</p>;
  return null;
}

interface CollaboratorsListProps {
  items: Collaborator[];
  todoId: number;
  isOwner: boolean;
}

function CollaboratorsList({ items, todoId, isOwner }: CollaboratorsListProps) {
  if (items.length === 0) return null;
  return (
    <ul className={styles.list}>
      {items.map((c) => (
        <CollaboratorRow key={c.id} collaborator={c} todoId={todoId} isOwner={isOwner} />
      ))}
    </ul>
  );
}

interface TodoCollaboratorsProps {
  todoId: number;
  isOwner: boolean;
}

// Owner-or-collaborator can view this list; only the owner sees invite/remove
// controls — mirrors the real backend's access rules exactly.
export function TodoCollaborators({ todoId, isOwner }: TodoCollaboratorsProps) {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector(selectCollaboratorsForTodo(todoId));

  useEffect(() => {
    dispatch(fetchCollaborators(todoId));
  }, [dispatch, todoId]);

  return (
    <div className={styles.panel}>
      <CollaboratorsStatus status={status} error={error} isEmpty={items.length === 0} />
      <CollaboratorsList items={items} todoId={todoId} isOwner={isOwner} />
      {isOwner && <InviteForm todoId={todoId} />}
    </div>
  );
}
