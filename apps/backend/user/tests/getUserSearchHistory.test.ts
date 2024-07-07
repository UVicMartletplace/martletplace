import { describe, it, expect, vi } from 'vitest';
import { getUserSearchHistory } from '../src/getUserSearchHistory';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';

describe('Get User Search History Endpoint', () => {
  it('should return search history successfully', async () => {
    const req = {
      params: { id: '1' },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      any: vi.fn().mockResolvedValueOnce([
        { search_id: 'A12334B345', search_term: 'athletic shorts' },
      ]),
    } as unknown as IDatabase<object>;

    await getUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      searches: [
        {
          searchTerm: 'athletic shorts',
          searchID: 'A12334B345',
        },
      ],
    });
  });

  it('should return an error if user not found', async () => {
    const req = {
      params: { id: '1' },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      any: vi.fn().mockResolvedValueOnce([]),
    } as unknown as IDatabase<object>;

    await getUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should return an error if no search history found', async () => {
    const req = {
      params: { id: '1' },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      any: vi.fn().mockResolvedValueOnce([{ user_id: '1', search_id: null }]),
    } as unknown as IDatabase<object>;

    await getUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'No search history found for this user' });
  });

  it('should return an error if there is a server error', async () => {
    const req = {
      params: { id: '1' },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      any: vi.fn().mockRejectedValueOnce(new Error('Database error')),
    } as unknown as IDatabase<object>;

    await getUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
  });

  it('should return an error if user ID is not provided', async () => {
    const req = {
      params: { id: '' },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {} as unknown as IDatabase<object>;

    await getUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'User ID is required' });
  });
});
