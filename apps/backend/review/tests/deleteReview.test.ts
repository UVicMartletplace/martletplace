import { describe, it, expect, vi } from 'vitest';
import { deleteReview } from '../src/deleteReview';
import { Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Delete Review Endpoint', () => {
  it('should delete a review successfully', async () => {
    const req = {
      params: { id: '1' },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      result: vi.fn().mockResolvedValue({ rowCount: 1 }),
    } as unknown as IDatabase<object>;

    await deleteReview(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Review deleted successfully' });
  });

  it('should return an error if review not found', async () => {
    const req = {
      params: { id: '9999' },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      result: vi.fn().mockResolvedValue({ rowCount: 0 }),
    } as unknown as IDatabase<object>;

    await deleteReview(req, res, db);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Review not found' });
  });
});
