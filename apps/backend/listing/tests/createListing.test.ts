import { describe, it, expect, vi } from 'vitest';
import { createListing } from '../src/createListing';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Create Listing Endpoint', () => {
  it('should create a new listing successfully', async () => {
    const req = {
      body: {
        listing: {
          title: 'Sample Listing',
          description: 'This is a sample listing description',
          price: 100,
          location: {
            latitude: 48.4284,
            longitude: -123.3656,
          },
          images: [
            { url: 'https://example.com/image1.png' },
            { url: 'https://example.com/image2.png' },
          ],
        },
      },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      one: vi.fn()
        .mockImplementationOnce(() => Promise.resolve({
          listing_id: 1,
          title: 'Sample Listing',
          description: 'This is a sample listing description',
          price: 100,
          location: '48.4284,-123.3656',
          image_urls: [
            'https://example.com/image1.png',
            'https://example.com/image2.png',
          ],
          status: 'AVAILABLE',
          created_at: new Date(),
          modified_at: new Date(),
          seller_id: 1,
        }))
        .mockImplementationOnce(() => Promise.resolve({
          userID: 1,
          username: 'sampleuser',
          name: 'Sample User',
          bio: 'This is a sample user bio',
          profilePictureUrl: 'https://example.com/profile.png',
        })),
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await createListing(req, res, db);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      listing: {
        listingID: 1,
        seller_profile: {
          userID: 1,
          username: 'sampleuser',
          name: 'Sample User',
          bio: 'This is a sample user bio',
          profilePictureUrl: 'https://example.com/profile.png',
        },
        title: 'Sample Listing',
        description: 'This is a sample listing description',
        price: 100,
        location: {
          latitude: 48.4284,
          longitude: -123.3656,
        },
        status: 'AVAILABLE',
        dateCreated: expect.any(Date),
        dateModified: expect.any(Date),
        reviews: [],
        images: [
          { url: 'https://example.com/image1.png' },
          { url: 'https://example.com/image2.png' },
        ],
      },
    });
  });

  it('should fail to create a new listing with missing parameters', async () => {
    const req = {
      body: {
        listing: {
          title: 'Sample Listing',
          description: 'This is a sample listing description',
          price: 100,
          location: {},
        },
      },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      one: vi.fn(),
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await createListing(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'missing parameter in request' });
  });
});
