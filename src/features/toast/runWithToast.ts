import type { AppDispatch } from '../../app/store';
import { showToast } from './toastSlice';

// Runs a mutation, showing a toast on failure (always) and on success (only
// if a message is given — noisy actions like a completed-toggle skip it).
// Centralizes the try/catch every mutation needs (PR_STANDARDS.md rule 12)
// instead of repeating it at every call site.
export async function runWithToast(
  dispatch: AppDispatch,
  action: () => Promise<unknown>,
  successMessage?: string
): Promise<void> {
  try {
    await action();
    if (successMessage) dispatch(showToast({ message: successMessage, variant: 'success' }));
  } catch (err) {
    dispatch(showToast({ message: (err as Error).message, variant: 'error' }));
  }
}
