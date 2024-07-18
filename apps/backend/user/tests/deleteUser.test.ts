import { describe, it, expect, vi } from 'vitest';
import { deleteUser } from '../src/deleteUser';
import { Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Delete User Endpoint', () => {
  it('should delete a user successfully', async () => {
    const req = {
      user: { userId: 2 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      none: vi.fn().mockResolvedValueOnce(undefined),
      oneOrNone: vi.fn().mockResolvedValueOnce({
        user_id: 2,
        username: 'johndoe',
        email: 'johndoe@example.com',
        name: 'John Doe',
      }),
    } as unknown as IDatabase<object>;

    await deleteUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
  });

  it('should return an error if trying to delete the base user', async () => {
    const req = {
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      none: vi.fn(),
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await deleteUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cannot delete the base user' });
  });

  it('should return an error if user not found', async () => {
    const req = {
      user: { userId: 2 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      none: vi.fn().mockResolvedValueOnce(undefined),
      oneOrNone: vi.fn().mockResolvedValueOnce(null),
    } as unknown as IDatabase<object>;

    await deleteUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should return an error if there is a server error', async () => {
    const req = {
      user: { userId: 2 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      none: vi.fn().mockRejectedValueOnce(new Error('Database error')),
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await deleteUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
  });
});
