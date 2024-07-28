import { describe, it, expect, vi } from 'vitest';
import { getCharities } from '../src/getCharities';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Get Charities Endpoint', () => {
  it('should retrieve a list of charities successfully', async () => {
    const req = {
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      manyOrNone: vi.fn(() => Promise.resolve([
        {
          id: '1',
          name: 'Charity 1',
          description: 'Description 1',
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2024-12-31T23:59:59.999Z',
          image_url: 'https://example.com/charity1.png',
          organizations: [
            { name: 'Org 1', logoUrl: 'https://example.com/logo1.png', donated: 100, receiving: true },
            { name: 'Org 2', logoUrl: 'https://example.com/logo2.png', donated: 200, receiving: false },
          ],
          funds: 300,
          listingsCount: 2,
        },
        {
          id: '2',
          name: 'Charity 2',
          description: 'Description 2',
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2024-12-31T23:59:59.999Z',
          image_url: 'https://example.com/charity2.png',
          organizations: [
            { name: 'Org 3', logoUrl: 'https://example.com/logo3.png', donated: 150, receiving: true },
          ],
          funds: 150,
          listingsCount: 1,
        }
      ])),
    } as unknown as IDatabase<object>;

    await getCharities(req, res, db);

    expect(res.json).toHaveBeenCalledWith([
      {
        id: '1',
        name: 'Charity 1',
        description: 'Description 1',
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T23:59:59.999Z',
        image_url: 'https://example.com/charity1.png',
        organizations: [
          { name: 'Org 1', logoUrl: 'https://example.com/logo1.png', donated: 100, receiving: true },
          { name: 'Org 2', logoUrl: 'https://example.com/logo2.png', donated: 200, receiving: false },
        ],
        funds: 300,
        listingsCount: 2,
      },
      {
        id: '2',
        name: 'Charity 2',
        description: 'Description 2',
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T23:59:59.999Z',
        image_url: 'https://example.com/charity2.png',
        organizations: [
          { name: 'Org 3', logoUrl: 'https://example.com/logo3.png', donated: 150, receiving: true },
        ],
        funds: 150,
        listingsCount: 1,
      }
    ]);
  });

  it('should handle empty charities list', async () => {
    const req = {
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      manyOrNone: vi.fn(() => Promise.resolve([])),
    } as unknown as IDatabase<object>;

    await getCharities(req, res, db);

    expect(res.json).toHaveBeenCalledWith([]);
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
      manyOrNone: vi.fn(() => Promise.reject(new Error('Database error'))),
    } as unknown as IDatabase<object>;

    await getCharities(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "An error occurred while getting the charities",
    });
  });
});
