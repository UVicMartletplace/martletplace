import { describe, it, expect, vi } from 'vitest';
import { getListingById } from '../src/getListingById';
import { Request, Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Get Listing by ID Endpoint', () => {
  it('should retrieve a listing successfully and calculate zero distance for same coordinates', async () => {
    const req = {
      params: { id: '1' },
      user: { userId: 1 }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn()
        .mockImplementationOnce(() => Promise.resolve({
          listingID: 1,
          seller_profile: {
            userID: 1,
            username: 'sampleuser',
            name: 'Sample User',
            bio: 'This is a sample user bio',
            profilePictureUrl: 'https://example.com/profile.png',
          },
          title: 'Listing One',
          description: 'Description for listing one',
          price: 100,
          location: '48.4284,-123.3656',
          status: 'AVAILABLE',
          dateCreated: '2024-07-30T18:17:02.944Z',
          dateModified: '2024-07-30T18:17:02.944Z',
          image_urls: [
            'https://example.com/image1.png',
            'https://example.com/image2.png',
          ],
          charityId: 1,
        })),
      any: vi.fn().mockResolvedValue([{
        listing_review_id: 1,
        reviewerName: 'Reviewer One',
        stars: 5,
        comment: 'Great listing!',
        userID: 2,
        listingID: 1,
        dateCreated: '2024-07-30T18:17:02.944Z',
        dateModified: '2024-07-30T18:17:02.944Z',
      }]),
    } as unknown as IDatabase<object>;

    await getListingById(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      listingID: 1,
      seller_profile: {
        userID: 1,
        username: 'sampleuser',
        name: 'Sample User',
        bio: 'This is a sample user bio',
        profilePictureUrl: 'https://example.com/profile.png',
      },
      title: 'Listing One',
      description: 'Description for listing one',
      price: 100,
      location: {
        latitude: 48.4284,
        longitude: -123.3656,
      },
      status: 'AVAILABLE',
      dateCreated: '2024-07-30T18:17:02.944Z',
      dateModified: '2024-07-30T18:17:02.944Z',
      reviews: [
        {
          listing_review_id: 1,
          reviewerName: 'Reviewer One',
          stars: 5,
          comment: 'Great listing!',
          userID: 2,
          listingID: 1,
          dateCreated: '2024-07-30T18:17:02.944Z',
          dateModified: '2024-07-30T18:17:02.944Z',
        },
      ],
      images: [
        { url: 'https://example.com/image1.png' },
        { url: 'https://example.com/image2.png' },
      ],
      distance: 0,
      charityId: 1,
    });
  });

  it('should fail to retrieve a non-existent listing', async () => {
    const req = {
      params: { id: '9999' },
      user: { userId: 1 }
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValue(null),
      any: vi.fn(),
    } as unknown as IDatabase<object>;

    await getListingById(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ listing: {} });
  });
});
