import { describe, it, expect, vi } from 'vitest';
import { deleteUserSearch } from '../src/deleteUserSearch';
import { Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Delete User Search Endpoint', () => {
  it('should delete search entry successfully', async () => {
    const req = {
      params: { searchID: 'A12334B345' },
      user: { id: '1' }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValueOnce({ search_id: 'A12334B345' }),
    } as unknown as IDatabase<object>;

    await deleteUserSearch(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Search entry deleted successfully' });
  });

  it('should return an error if search entry not found', async () => {
    const req = {
      params: { searchID: 'A12334B345' },
      user: { id: '1' }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValueOnce(null),
    } as unknown as IDatabase<object>;

    await deleteUserSearch(req, res, db);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Search entry not found' });
  });

  it('should return an error if search ID is not provided', async () => {
    const req = {
      params: { searchID: '' },
      user: { id: '1' }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {} as unknown as IDatabase<object>;

    await deleteUserSearch(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Search ID is required' });
  });

  it('should return an error if there is a server error', async () => {
    const req = {
      params: { searchID: 'A12334B345' },
      user: { id: '1' }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockRejectedValueOnce(new Error('Database error')),
    } as unknown as IDatabase<object>;

    await deleteUserSearch(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
  });
});
