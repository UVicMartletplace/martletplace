import { describe, it, expect, vi } from 'vitest';
import { getListingsByUser } from '../src/getListingsByUser';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Get Listings by User Endpoint', () => {
  it('should retrieve all listings for the authenticated user successfully', async () => {
    const req = {
      user: { userId: 1 }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      any: vi.fn().mockResolvedValue([
        {
          listingID: 1,
          title: 'Sample Listing',
          description: 'This is a sample listing description',
          price: 100,
          location: '48.4284,-123.3656',
          status: 'AVAILABLE',
          dateCreated: new Date(),
          dateModified: new Date(),
          images: [
            'https://example.com/image1.png',
            'https://example.com/image2.png',
          ],
        },
      ]),
    } as unknown as IDatabase<object>;

    await getListingsByUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        listingID: 1,
        title: 'Sample Listing',
        description: 'This is a sample listing description',
        price: 100,
        location: '48.4284,-123.3656',
        status: 'AVAILABLE',
        dateCreated: expect.any(Date),
        dateModified: expect.any(Date),
        images: [
          { url: 'https://example.com/image1.png' },
          { url: 'https://example.com/image2.png' },
        ],
      },
    ]);
  });

  it('should return 404 if no listings are found for the user', async () => {
    const req = {} as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      any: vi.fn().mockResolvedValue([]),
    } as unknown as IDatabase<object>;

    await getListingsByUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'No listings found for this user' });
  });
});
