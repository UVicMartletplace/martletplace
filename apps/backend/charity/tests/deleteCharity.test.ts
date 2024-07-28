import { describe, it, expect, vi } from 'vitest';
import { deleteCharity } from '../src/deleteCharity';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Delete Charity Endpoint', () => {
  it('should delete an existing charity successfully', async () => {
    const req = {
      params: { id: '1' },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      result: vi.fn(() => Promise.resolve({ rowCount: 1 })),
    } as unknown as IDatabase<object>;

    await deleteCharity(req, res, db);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({ message: "Charity deleted successfully" });
  });

  it('should return an error if the charity does not exist', async () => {
    const req = {
      params: { id: '999' },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      result: vi.fn(() => Promise.resolve({ rowCount: 0 })),
    } as unknown as IDatabase<object>;

    await deleteCharity(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Charity not found" });
  });

  it('should handle errors during the deletion process', async () => {
    const req = {
      params: { id: '1' },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      result: vi.fn(() => Promise.reject(new Error('Database error'))),
    } as unknown as IDatabase<object>;

    await deleteCharity(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "An error occurred while deleting the charity" });
  });
});
