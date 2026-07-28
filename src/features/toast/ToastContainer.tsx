import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { TOAST_DURATION_MS } from './toast.constants';
import { dismissToast, selectToasts, type ToastMessage } from './toastSlice';
import styles from './ToastContainer.module.scss';

interface ToastItemProps {
  toast: ToastMessage;
}

// One toast — schedules its own auto-dismiss, cleaned up if it unmounts
// early (e.g. dismissed manually) or on a fast re-render.
function ToastItem({ toast }: ToastItemProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <div className={`${styles.toast} ${styles[toast.variant]}`} role="status">
      {toast.message}
    </div>
  );
}

// Renders every active toast — mount once near the app root (see App.tsx).
// Mutations across auth/todos dispatch `showToast` (see runWithToast.ts) and
// this is the single place that actually displays them.
export function ToastContainer() {
  const toasts = useAppSelector(selectToasts);

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
