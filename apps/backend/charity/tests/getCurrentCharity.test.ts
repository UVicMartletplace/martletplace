import { describe, it, expect, vi } from 'vitest';
import { getCurrentCharity } from '../src/getCurrentCharity';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Get Current Charity Endpoint', () => {
  it('should retrieve the current active charity successfully', async () => {
    const req = {
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValueOnce({
        id: '1',
        name: 'Charity 1',
        description: 'Description 1',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        imageUrl: 'https://example.com/charity1.png',
        organizations: [
          { name: 'Org 1', logoUrl: 'https://example.com/logo1.png', donated: 100, receiving: true },
          { name: 'Org 2', logoUrl: 'https://example.com/logo2.png', donated: 200, receiving: false },
        ],
      }),
      one: vi.fn()
        .mockResolvedValueOnce({ donation_funds: 300 })
        .mockResolvedValueOnce({ listing_funds: 500, listings_count: 10 }),
    } as unknown as IDatabase<object>;

    await getCurrentCharity(req, res, db);

    expect(res.json).toHaveBeenCalledWith({
      id: '1',
      name: 'Charity 1',
      description: 'Description 1',
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.999Z',
      imageUrl: 'https://example.com/charity1.png',
      organizations: [
        { name: 'Org 1', logoUrl: 'https://example.com/logo1.png', donated: 100, receiving: true },
        { name: 'Org 2', logoUrl: 'https://example.com/logo2.png', donated: 200, receiving: false },
      ],
      funds: 800,
      listingsCount: 10,
    });
  });

  it('should return a message if no active charity is found', async () => {
    const req = {
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(() => Promise.resolve(null)),
    } as unknown as IDatabase<object>;

    await getCurrentCharity(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "No active charity" });
  });

  it('should handle errors during the retrieval process', async () => {
    const req = {
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(() => Promise.reject(new Error('Database error'))),
    } as unknown as IDatabase<object>;

    await getCurrentCharity(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Something went wrong" });
  });
});
