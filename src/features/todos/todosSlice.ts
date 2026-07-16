import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import type { Todo } from '../../types';
import { todosApi, type CreateTodoDto, type UpdateTodoDto } from './todosApi';

interface TodosState {
  items: Todo[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TodosState = {
  items: [],
  status: 'idle',
  error: null,
};

function requireToken(state: RootState): string {
  const token = state.auth.accessToken;
  if (!token) throw new Error('Not authenticated');
  return token;
}

export const fetchTodos = createAsyncThunk<Todo[], void, { state: RootState }>(
  'todos/fetchTodos',
  async (_, { getState }) => todosApi.getAll(requireToken(getState()))
);

export const addTodo = createAsyncThunk<Todo, CreateTodoDto, { state: RootState }>(
  'todos/addTodo',
  async (dto, { getState }) => todosApi.create(requireToken(getState()), dto)
);

export const updateTodo = createAsyncThunk<
  Todo,
  { id: number; dto: UpdateTodoDto },
  { state: RootState }
>('todos/updateTodo', async ({ id, dto }, { getState }) => todosApi.update(requireToken(getState()), id, dto));

export const deleteTodo = createAsyncThunk<number, number, { state: RootState }>(
  'todos/deleteTodo',
  async (id, { getState }) => {
    await todosApi.remove(requireToken(getState()), id);
    return id;
  }
);

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    clearTodos(state) {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action: PayloadAction<Todo[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load todos';
      })

      .addCase(addTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        state.items.push(action.payload);
      })

      .addCase(updateTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        state.items = state.items.map((t) => (t.id === action.payload.id ? action.payload : t));
      })

      .addCase(deleteTodo.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export const { clearTodos } = todosSlice.actions;
export default todosSlice.reducer;

export const selectTodos = (state: RootState) => state.todos.items;
export const selectTodosStatus = (state: RootState) => state.todos.status;
export const selectTodosError = (state: RootState) => state.todos.error;
export const selectCompletedCount = (state: RootState) =>
  state.todos.items.filter((t) => t.completed).length;
