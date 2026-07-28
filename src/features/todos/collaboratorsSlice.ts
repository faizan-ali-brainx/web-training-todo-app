import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { Collaborator } from '../../types';
import { collaboratorsApi } from './collaboratorsApi';

interface CollaboratorsForTodo {
  items: Collaborator[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface CollaboratorsState {
  byTodoId: Record<number, CollaboratorsForTodo>;
}

const initialState: CollaboratorsState = { byTodoId: {} };

const emptyEntry: CollaboratorsForTodo = { items: [], status: 'idle', error: null };

function entryFor(state: CollaboratorsState, todoId: number): CollaboratorsForTodo {
  return state.byTodoId[todoId] ?? emptyEntry;
}

function requireToken(state: RootState): string {
  const token = state.auth.accessToken;
  if (!token) throw new Error('Not authenticated');
  return token;
}

export const fetchCollaborators = createAsyncThunk<
  { todoId: number; collaborators: Collaborator[] },
  number,
  { state: RootState }
>('collaborators/fetch', async (todoId, { getState }) => ({
  todoId,
  collaborators: await collaboratorsApi.list(requireToken(getState()), todoId),
}));

export const inviteCollaborator = createAsyncThunk<
  { todoId: number; collaborator: Collaborator },
  { todoId: number; email: string },
  { state: RootState }
>('collaborators/invite', async ({ todoId, email }, { getState }) => {
  const invite = await collaboratorsApi.invite(requireToken(getState()), todoId, email);
  return { todoId, collaborator: invite.user };
});

export const removeCollaborator = createAsyncThunk<
  { todoId: number; userId: number },
  { todoId: number; userId: number },
  { state: RootState }
>('collaborators/remove', async ({ todoId, userId }, { getState }) => {
  await collaboratorsApi.remove(requireToken(getState()), todoId, userId);
  return { todoId, userId };
});

function handleFetchPending(state: CollaboratorsState, action: { meta: { arg: number } }) {
  const todoId = action.meta.arg;
  state.byTodoId[todoId] = { ...entryFor(state, todoId), status: 'loading', error: null };
}

function handleFetchFulfilled(
  state: CollaboratorsState,
  action: PayloadAction<{ todoId: number; collaborators: Collaborator[] }>
) {
  state.byTodoId[action.payload.todoId] = {
    items: action.payload.collaborators,
    status: 'succeeded',
    error: null,
  };
}

function handleFetchRejected(
  state: CollaboratorsState,
  action: { meta: { arg: number }; error: { message?: string } }
) {
  const todoId = action.meta.arg;
  state.byTodoId[todoId] = {
    items: entryFor(state, todoId).items,
    status: 'failed',
    error: action.error.message ?? 'Failed to load collaborators',
  };
}

function handleInviteFulfilled(
  state: CollaboratorsState,
  action: PayloadAction<{ todoId: number; collaborator: Collaborator }>
) {
  const { todoId, collaborator } = action.payload;
  const entry = entryFor(state, todoId);
  state.byTodoId[todoId] = { ...entry, items: [...entry.items, collaborator] };
}

function handleRemoveFulfilled(
  state: CollaboratorsState,
  action: PayloadAction<{ todoId: number; userId: number }>
) {
  const { todoId, userId } = action.payload;
  const entry = entryFor(state, todoId);
  state.byTodoId[todoId] = { ...entry, items: entry.items.filter((c) => c.id !== userId) };
}

const collaboratorsSlice = createSlice({
  name: 'collaborators',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollaborators.pending, handleFetchPending)
      .addCase(fetchCollaborators.fulfilled, handleFetchFulfilled)
      .addCase(fetchCollaborators.rejected, handleFetchRejected)
      .addCase(inviteCollaborator.fulfilled, handleInviteFulfilled)
      .addCase(removeCollaborator.fulfilled, handleRemoveFulfilled);
  },
});

export default collaboratorsSlice.reducer;

export const selectCollaboratorsForTodo = (todoId: number) => (state: RootState) =>
  state.collaborators.byTodoId[todoId] ?? emptyEntry;
