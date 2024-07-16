import { describe, it, expect, vi } from 'vitest';
import { getUser } from '../src/getUser';
import { Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Get User Endpoint', () => {
  it('should return user data successfully', async () => {
    const req = {
      params: { id: '1' },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValueOnce({
        user_id: 1,
        username: 'johndoe',
        email: 'johndoe@example.com',
        name: 'John Doe',
        bio: 'A software developer',
        profile_pic_url: 'http://example.com/profile.jpg',
      }),
    } as unknown as IDatabase<object>;

    await getUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@example.com',
      bio: 'A software developer',
      profileUrl: 'http://example.com/profile.jpg',
    });
  });

  it('should return an error if user not found', async () => {
    const req = {
      params: { id: '1' },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValueOnce(null),
    } as unknown as IDatabase<object>;

    await getUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should return an error if there is a server error', async () => {
    const req = {
      params: { id: '1' },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockRejectedValueOnce(new Error('Database error')),
    } as unknown as IDatabase<object>;

    await getUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
  });
});
