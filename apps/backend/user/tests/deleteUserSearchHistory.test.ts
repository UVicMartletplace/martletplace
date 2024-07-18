import { describe, it, expect, vi } from 'vitest';
import { deleteUserSearchHistory } from '../src/deleteUserSearchHistory';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from "../../lib/src/auth";

describe('Delete User Search History Endpoint', () => {
  it('should delete all search history successfully', async () => {
    const req = {
      user: { userId: '1' }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      result: vi.fn().mockResolvedValueOnce({ rowCount: 5 }), // mocking the deletion operation
    } as unknown as IDatabase<object>;

    await deleteUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "All search history deleted successfully",
    });
  });

  it('should return a success message even if no search history found', async () => {
    const req = {
      user: { userId: '1' }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      result: vi.fn().mockResolvedValueOnce({ rowCount: 0 }), // mocking the deletion operation
    } as unknown as IDatabase<object>;

    await deleteUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "All search history deleted successfully" });
  });

  it('should return an error if there is a server error', async () => {
    const req = {
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
});
