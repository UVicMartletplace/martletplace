import { describe, it, expect, vi } from 'vitest';
import { getReview } from '../src/getReview';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';

describe('Get Review Endpoint', () => {
  it('should retrieve a review successfully', async () => {
    const req = {
      params: { id: '1' },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValue({
        review_id: 1,
        reviewerName: 'johndoe',
        stars: 5,
        comment: 'Great product!',
        userID: 1,
        listingID: 1,
        dateCreated: new Date(),
        dateModified: new Date(),
      }),
    } as unknown as IDatabase<object>;

    await getReview(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      review_id: 1,
      reviewerName: 'johndoe',
      stars: 5,
      comment: 'Great product!',
      userID: 1,
      listingID: 1,
      dateCreated: expect.any(Date),
      dateModified: expect.any(Date),
    });
  });

  it('should return an error if review not found', async () => {
    const req = {
      params: { id: '9999' },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValue(null),
    } as unknown as IDatabase<object>;

    await getReview(req, res, db);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Review not found' });
  });
});
