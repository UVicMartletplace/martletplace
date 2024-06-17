import request from 'supertest';
import { app, getListingById } from './index';

describe('GET /api/listing/:id', () => {
  it('should return data for valid listing id (1)', async () => {
    const mockRequest = { params: { id: '1' } };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await getListingById(mockRequest as any, mockResponse as any, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
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
        'https://api.dicebear.com/8.x/bottts/svg?seed=Bella',
      ],
      created_at: '2024-06-08T02:58:38.446Z',
      modified_at: '2024-06-08T02:58:38.446Z',
    });
  });

  it('should return 404 for invalid listing id (999)', async () => {
    const mockRequest = { params: { id: '999' } };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();

    await getListingById(mockRequest as any, mockResponse as any, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Listing not found',
    });
  });
});

// Example of using supertest to test the actual API endpoint
describe('GET /api/listing/:id (integration test)', () => {
  it('should return data for valid listing id (1)', async () => {
    const response = await request(app).get('/api/listing/1');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
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
        'https://api.dicebear.com/8.x/bottts/svg?seed=Bella',
      ],
      created_at: '2024-06-08T02:58:38.446Z',
      modified_at: '2024-06-08T02:58:38.446Z',
    });
  });

  it('should return 404 for invalid listing id (999)', async () => {
    const response = await request(app).get('/api/listing/999');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Listing not found',
    });
  });
});