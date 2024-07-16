import { describe, it, expect, vi } from 'vitest';
import { deleteListing } from '../src/deleteListing';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';

describe('Delete Listing Endpoint', () => {
  it('should delete a listing successfully', async () => {
    const req = {
      params: { id: '3' },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      result: vi.fn().mockResolvedValue({ rowCount: 1 }),
    } as unknown as IDatabase<object>;

    await deleteListing(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Listing deleted successfully' });
  });

  it('should fail to delete a non-existent listing', async () => {
    const req = {
      params: { id: '9999' },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      result: vi.fn().mockResolvedValue({ rowCount: 0 }),
    } as unknown as IDatabase<object>;

    await deleteListing(req, res, db);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({ error: 'Listing not found' });
  });
});
