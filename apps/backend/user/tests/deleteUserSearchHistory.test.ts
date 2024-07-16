import { describe, it, expect, vi } from 'vitest';
import { deleteUserSearchHistory } from '../src/deleteUserSearchHistory';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from "../../lib/src/auth";

describe('Delete User Search History Endpoint', () => {
  it('should delete all search history successfully', async () => {
    const req = {
      params: { userID: '1' },
      user: { userId: '1' }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      result: vi.fn().mockResolvedValueOnce(5), // assuming 5 rows were deleted
    } as unknown as IDatabase<object>;

    await deleteUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "All search history deleted successfully",
    });
  });

  it('should return an error if no search history found', async () => {
    const req = {
      params: { userID: '1' },
      user: { userId: '1' }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      result: vi.fn().mockResolvedValueOnce(0),
    } as unknown as IDatabase<object>;

    await deleteUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "No search history found for this user" });
  });

  it('should return an error if there is a server error', async () => {
    const req = {
      params: { userID: '1' },
      user: { userId: '1' }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      result: vi.fn().mockRejectedValueOnce(new Error('Database error')),
    } as unknown as IDatabase<object>;

    await deleteUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
  });

  it('should return an error if user ID is not provided', async () => {
    const req = {
      params: { userID: '' },
      user: { userId: '1' }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {} as unknown as IDatabase<object>;

    await deleteUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'User ID is required' });
  });

  it('should return an error if user ID does not match authenticated user', async () => {
    const req = {
      params: { userID: '2' },
      user: { userId: '1' }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {} as unknown as IDatabase<object>;

    await deleteUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized action' });
  });
});
