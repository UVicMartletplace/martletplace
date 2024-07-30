import { describe, it, expect, vi } from 'vitest';
import { updateReview } from '../src/updateReview';
import { Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Update Review Endpoint', () => {
  it('should update a review successfully', async () => {
    const req = {
      params: { id: '1' },
      body: {
        stars: 5,
        comment: 'Updated review',
        listingID: 1,
      },
      user: { userId: 1 }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValue({
        review_id: 1,
        review: 'Updated review',
        rating_value: 5,
        user_id: 1,
        listing_id: 1,
        created_at: new Date(),
        modified_at: new Date(),
      }),
    } as unknown as IDatabase<object>;

    await updateReview(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Review edited successfully' });
  });

  it('should return an error if review not found', async () => {
    const req = {
      params: { id: '9999' },
      body: {
        stars: 5,
        comment: 'Updated review',
        listingID: 1,
      },
      user: { userId: 1 }
    } as unknown as AuthenticatedRequest;
    

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValue(null),
    } as unknown as IDatabase<object>;

    await updateReview(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ error: 'Review not found' });
  });
});
