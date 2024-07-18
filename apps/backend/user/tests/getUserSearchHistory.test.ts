import { describe, it, expect, vi } from 'vitest';
import { getUserSearchHistory } from '../src/getUserSearchHistory';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from "../../lib/src/auth";

describe('Get User Search History Endpoint', () => {
  it('should return the top 5 search history successfully in order', async () => {
    const req = {
      user: { userId: '1' }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      any: vi.fn().mockResolvedValueOnce([
        { search_id: 'E12334B345', search_term: 'gym bag', created_at: '2024-07-16T14:05:00Z' },
        { search_id: 'D12334B345', search_term: 'water bottle', created_at: '2024-07-16T14:04:00Z' },
        { search_id: 'C12334B345', search_term: 'yoga mat', created_at: '2024-07-16T14:03:00Z' },
        { search_id: 'B12334B345', search_term: 'running shoes', created_at: '2024-07-16T14:02:00Z' },
        { search_id: 'A12334B345', search_term: 'athletic shorts', created_at: '2024-07-16T14:01:00Z' }
      ]),
    } as unknown as IDatabase<object>;

    await getUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      searches: [
        { searchTerm: 'gym bag', searchID: 'E12334B345' },
        { searchTerm: 'water bottle', searchID: 'D12334B345' },
        { searchTerm: 'yoga mat', searchID: 'C12334B345' },
        { searchTerm: 'running shoes', searchID: 'B12334B345' },
        { searchTerm: 'athletic shorts', searchID: 'A12334B345' }
      ],
    });
  });

  it('should return an empty list if no search history is found', async () => {
    const req = {
      user: { userId: '1' }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      any: vi.fn().mockResolvedValueOnce([]),
    } as unknown as IDatabase<object>;

    await getUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ searches: [] });
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
      any: vi.fn().mockRejectedValueOnce(new Error('Database error')),
    } as unknown as IDatabase<object>;

    await getUserSearchHistory(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
  });
});
