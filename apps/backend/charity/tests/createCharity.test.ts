import { describe, it, expect, vi } from 'vitest';
import { createCharity } from '../src/createCharity';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Create Charity Endpoint', () => {
  it('should create a new charity successfully', async () => {
    const req = {
      body: {
        name: 'Sample Charity',
        description: 'This is a sample charity description',
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T23:59:59.999Z',
        image_url: 'https://example.com/charity.png',
        organizations: [
          { name: 'Org 1', logoUrl: 'https://example.com/logo1.png', donated: 100, receiving: 50, charity_id: 1 },
          { name: 'Org 2', logoUrl: 'https://example.com/logo2.png', donated: 200, receiving: 150, charity_id: 1 },
        ],
      },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn()
        .mockImplementationOnce(() => Promise.resolve({
          charity_id: 1,
          name: 'Sample Charity',
          description: 'This is a sample charity description',
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2024-12-31T23:59:59.999Z',
          image_url: 'https://example.com/charity.png',
        }))
        .mockImplementationOnce(() => Promise.resolve({
          name: 'Org 1',
          logo_url: 'https://example.com/logo1.png',
          donated: 100,
          receiving: 50,
        }))
        .mockImplementationOnce(() => Promise.resolve({
          name: 'Org 2',
          logo_url: 'https://example.com/logo2.png',
          donated: 200,
          receiving: 150,
        })),
    } as unknown as IDatabase<object>;

    await createCharity(req, res, db);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      name: 'Sample Charity',
      description: 'This is a sample charity description',
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.999Z',
      imageUrl: 'https://example.com/charity.png',
      organizations: [
        { name: 'Org 1', logo_url: 'https://example.com/logo1.png', donated: 100, receiving: 50 },
        { name: 'Org 2', logo_url: 'https://example.com/logo2.png', donated: 200, receiving: 150 },
      ],
      funds: 300,
      listingsCount: 0,
    });
  });

  it('should fail to create a new charity with missing parameters', async () => {
    const req = {
      body: {
        name: 'Sample Charity',
        description: 'This is a sample charity description',
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T23:59:59.999Z',
        organizations: [
          { name: 'Org 1', logoUrl: 'https://example.com/logo1.png', donated: 100, receiving: 50, charity_id: 1 },
        ],
      },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await createCharity(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'missing parameter in request' });
  });

  it('should fail to create a new charity with invalid organization structure', async () => {
    const req = {
      body: {
        name: 'Sample Charity',
        description: 'This is a sample charity description',
        start_date: '2024-01-01T00:00:00.000Z',
        end_date: '2024-12-31T23:59:59.999Z',
        image_url: 'https://example.com/charity.png',
        organizations: [
          { name: 'Org 1', logoUrl: 'https://example.com/logo1.png', donated: 100 },
        ],
      },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await createCharity(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "missing parameter in request" });
  });
});
