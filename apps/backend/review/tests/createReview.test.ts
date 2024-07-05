import { describe, it, expect, vi } from 'vitest';
import { createReview } from '../src/createReview';
import { Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Create Review Endpoint', () => {
  it('should create a review successfully', async () => {
    const req = {
      user: { userId: 1 },
      body: {
        stars: 5,
        comment: 'Great product!',
        listingID: 1,
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      one: vi.fn()
        .mockResolvedValueOnce({
          review_id: 1,
          review: 'Great product!',
          rating_value: 5,
          user_id: 1,
          listing_id: 1,
          created_at: new Date(),
          modified_at: new Date(),
        })
        .mockResolvedValueOnce({
          userID: 1,
          username: 'johndoe',
          name: 'John Doe',
        }),
    } as unknown as IDatabase<object>;

    await createReview(req, res, db);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      review_id: 1,
      reviewerName: 'John Doe',
      stars: 5,
      comment: 'Great product!',
      userID: 1,
      listingID: 1,
      dateCreated: expect.any(Date),
      dateModified: expect.any(Date),
    });
  });

  it('should return an error if parameters are missing', async () => {
    const req = {
      user: { userId: 1 },
      body: {
        stars: 5,
        comment: '',
        listingID: 1,
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      one: vi.fn(),
    } as unknown as IDatabase<object>;

    await createReview(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'missing parameter in request' });
  });
});
