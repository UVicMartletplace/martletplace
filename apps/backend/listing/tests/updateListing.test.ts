import { describe, it, expect, vi } from 'vitest';
import { updateListing } from '../src/updateListing';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';

describe('Update Listing Endpoint', () => {
  it('should update a listing successfully', async () => {
    const req = {
      params: { id: '1' },
      body: {
        listing: {
          title: 'Updated Listing One',
          description: 'Updated description for listing one',
          price: 150,
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
          images: [
            { url: 'https://example.com/image1.png' },
            { url: 'https://example.com/image2.png' },
          ],
        },
        status: 'AVAILABLE',
      },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValue({
        listing_id: 1,
        title: 'Updated Listing One',
        description: 'Updated description for listing one',
        price: 150,
        location: '40.7128,-74.0060',
        image_urls: [
          'https://example.com/image1.png',
          'https://example.com/image2.png',
        ],
        status: 'AVAILABLE',
        created_at: new Date(),
        modified_at: new Date(),
      }),
    } as unknown as IDatabase<object>;

    await updateListing(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      listingID: 1,
      title: 'Updated Listing One',
      description: 'Updated description for listing one',
      price: 150,
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
      status: 'AVAILABLE',
      dateCreated: expect.any(Date),
      dateModified: expect.any(Date),
      images: [
        { url: 'https://example.com/image1.png' },
        { url: 'https://example.com/image2.png' },
      ],
    });
  });

  it('should fail to update a non-existent listing', async () => {
    const req = {
      params: { id: '9999' },
      body: {
        listing: {
          title: 'Updated Listing Non-existent',
          description: 'Updated description for non-existent listing',
          price: 150,
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
          images: [
            { url: 'https://example.com/image1.png' },
            { url: 'https://example.com/image2.png' },
          ],
        },
        status: 'AVAILABLE',
      },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValue(null),
    } as unknown as IDatabase<object>;

    await updateListing(req, res, db);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Listing not found' });
  });
});
