import { describe, it, expect, vi } from 'vitest';
import { updateListing } from '../src/updateListing';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Update Listing Endpoint', () => {
  it('should update a listing successfully', async () => {
    const req = {
      params: { id: '1' },
      user: { userId: 1 },
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
          markedForCharity: false,
        },
        status: 'AVAILABLE',
      },
    } as unknown as AuthenticatedRequest;

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
        created_at: '2024-07-30T18:17:02.944Z',
        modified_at: '2024-07-30T18:17:02.944Z',
        charity_id: null,
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
      dateCreated: '2024-07-30T18:17:02.944Z',
      dateModified: '2024-07-30T18:17:02.944Z',
      images: [
        { url: 'https://example.com/image1.png' },
        { url: 'https://example.com/image2.png' },
      ],
      charityId: null,
    });
  });

  it('should fail to update a non-existent listing', async () => {
    const req = {
      params: { id: '9999' },
      user: { userId: 1 },
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
          markedForCharity: false,
        },
        status: 'AVAILABLE',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValue(null),
    } as unknown as IDatabase<object>;

    await updateListing(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ error: 'Listing not found' });
  });

  it('should update a listing with markedForCharity and fetch charity id', async () => {
    const req = {
      params: { id: '1' },
      user: { userId: 1 },
      body: {
        listing: {
          title: 'Updated Listing Two',
          description: 'Updated description for listing two',
          price: 150,
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
          images: [
            { url: 'https://example.com/image1.png' },
            { url: 'https://example.com/image2.png' },
          ],
          markedForCharity: true,
        },
        status: 'AVAILABLE',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn()
        .mockResolvedValueOnce({
          id: 1,
        })
        .mockResolvedValueOnce({
          listing_id: 1,
          title: 'Updated Listing Two',
          description: 'Updated description for listing two',
          price: 150,
          location: '40.7128,-74.0060',
          image_urls: [
            'https://example.com/image1.png',
            'https://example.com/image2.png',
          ],
          status: 'AVAILABLE',
          created_at: '2024-07-30T18:17:02.944Z',
          modified_at: '2024-07-30T18:17:02.944Z',
          charity_id: 1,
        }),
    } as unknown as IDatabase<object>;

    await updateListing(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      listingID: 1,
      title: 'Updated Listing Two',
      description: 'Updated description for listing two',
      price: 150,
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
      status: 'AVAILABLE',
      dateCreated: '2024-07-30T18:17:02.944Z',
      dateModified: '2024-07-30T18:17:02.944Z',
      images: [
        { url: 'https://example.com/image1.png' },
        { url: 'https://example.com/image2.png' },
      ],
      charityId: 1,
    });
  });
});
