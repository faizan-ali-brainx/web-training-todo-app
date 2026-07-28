import type { Collaborator, CollaboratorInvite } from '../../types';
import { assertCanAccess, assertIsOwner, findTodoOrThrow } from './mockAccessHelpers';
import { getUserIdFromToken } from './mockAuthApi';
import { db, delay, MockApiError, type StoredUser } from './mockDb';

function toCollaborator(user: StoredUser): Collaborator {
  return { id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified };
}

function findInviteeOrThrow(email: string): StoredUser {
  const invitee = db.read().users.find((u) => u.email === email);
  if (!invitee) throw new MockApiError(404, `No user with email ${email}`);
  return invitee;
}

function assertNotAlreadyCollaborator(todoId: number, userId: number): void {
  const exists = db.read().collaborators.some((c) => c.todoId === todoId && c.userId === userId);
  if (exists) throw new MockApiError(409, 'That user is already a collaborator');
}

function createCollaboratorRow(
  todoId: number,
  invitee: StoredUser,
  invitedBy: number
): CollaboratorInvite {
  let created!: CollaboratorInvite;
  db.write((s) => {
    const row = {
      id: s.nextCollaboratorId++,
      todoId,
      userId: invitee.id,
      invitedBy,
      createdAt: new Date().toISOString(),
    };
    s.collaborators.push(row);
    created = { ...row, user: toCollaborator(invitee) };
  });
  return created;
}

// Mock implementation of the collaborators endpoints — mirrors the real
// backend's owner-only invite/remove and owner-or-collaborator list rules.
export const mockCollaboratorsApi = {
  async list(token: string, todoId: number): Promise<Collaborator[]> {
    await delay(300);
    const userId = getUserIdFromToken(token);
    const todo = findTodoOrThrow(todoId);
    assertCanAccess(todo, userId);

    const state = db.read();
    return state.collaborators
      .filter((c) => c.todoId === todoId)
      .map((c) => toCollaborator(state.users.find((u) => u.id === c.userId)!));
  },

  async invite(token: string, todoId: number, email: string): Promise<CollaboratorInvite> {
    await delay(400);
    const userId = getUserIdFromToken(token);
    const todo = findTodoOrThrow(todoId);
    assertIsOwner(todo, userId);

    const invitee = findInviteeOrThrow(email);
    assertNotAlreadyCollaborator(todoId, invitee.id);

    return createCollaboratorRow(todoId, invitee, userId);
  },

  async remove(token: string, todoId: number, collaboratorUserId: number): Promise<void> {
    await delay(300);
    const userId = getUserIdFromToken(token);
    const todo = findTodoOrThrow(todoId);
    assertIsOwner(todo, userId);

    const state = db.read();
    const existed = state.collaborators.some((c) => c.todoId === todoId && c.userId === collaboratorUserId);
    if (!existed) throw new MockApiError(404, 'That user is not a collaborator on this todo');

    db.write((s) => {
      s.collaborators = s.collaborators.filter(
        (c) => !(c.todoId === todoId && c.userId === collaboratorUserId)
      );
    });
  },
};
