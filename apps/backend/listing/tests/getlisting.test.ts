import { Request, Response, NextFunction } from 'express';
import { getListingById } from '../src/index';

jest.mock('pg-promise', () => {
  return () => {
    return {
      oneOrNone: jest.fn()
    };
  };
});

const pgp = require('pg-promise')();

describe('GET /api/listing/:id', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: { id: '1' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    next = jest.fn();
  });

  it('should return listing details for a valid ID (passing test)', async () => {
    pgp.oneOrNone.mockResolvedValue({
      listing_id: 1,
      seller_id: 1,
      buyer_id: null,
      title: 'Listing One',
      price: 100,
      location: '(40.7128,-74.006)',
      status: 'AVAILABLE',
      description: 'Description for listing one',
      image_urls: [
        'https://api.dicebear.com/8.x/bottts/svg?seed=Jasper',
        'https://api.dicebear.com/8.x/bottts/svg?seed=Bella',
        'https://api.dicebear.com/8.x/bottts/svg?seed=Bella'
      ],
      created_at: '2024-06-08T02:58:38.446Z',
      modified_at: '2024-06-08T02:58:38.446Z'
    });

    await getListingById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      listing_id: 1,
      seller_id: 1,
      buyer_id: null,
      title: 'Listing One',
      price: 100,
      location: '(40.7128,-74.006)',
      status: 'AVAILABLE',
      description: 'Description for listing one',
      image_urls: [
        'https://api.dicebear.com/8.x/bottts/svg?seed=Jasper',
        'https://api.dicebear.com/8.x/bottts/svg?seed=Bella',
        'https://api.dicebear.com/8.x/bottts/svg?seed=Bella'
      ],
      created_at: '2024-06-08T02:58:38.446Z',
      modified_at: '2024-06-08T02:58:38.446Z'
    });
  });

  it('should return a 404 status for an invalid ID (failing test)', async () => {
    pgp.oneOrNone.mockResolvedValue(null);

    req.params = { id: '9999' };

    await getListingById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Listing not found'
    });
  });
});
