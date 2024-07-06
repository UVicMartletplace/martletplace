import { describe, it, expect, vi, Mock } from 'vitest';
import { patchUser } from '../src/patchUser';
import { Response } from 'express';
import { IDatabase } from 'pg-promise';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../../lib/src/auth';

vi.mock('bcryptjs'); // Mock bcryptjs

describe('Patch User Endpoint', () => {
  it('should update a user successfully', async () => {
    const req = {
      user: { userId: 2 },
      body: {
        username: 'newjohndoe',
        password: 'NewPassword123!',
        name: 'New John Doe',
        bio: 'A new software developer',
        profilePictureUrl: 'http://example.com/newprofile.jpg',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn()
        .mockResolvedValueOnce({
          user_id: 2,
          username: 'johndoe',
          email: 'johndoe@example.com',
          name: 'John Doe',
          bio: 'A software developer',
          profile_pic_url: 'http://example.com/profile.jpg',
          password: 'hashedOldPassword123!',
        })
        .mockResolvedValueOnce({
          user_id: 2,
          username: 'newjohndoe',
          email: 'johndoe@example.com',
          name: 'New John Doe',
          bio: 'A new software developer',
          profile_pic_url: 'http://example.com/newprofile.jpg',
        }),
    } as unknown as IDatabase<object>;

    (bcrypt.hash as Mock).mockResolvedValue('hashedNewPassword123!');

    await patchUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User updated successfully',
      user: {
        username: 'newjohndoe',
        email: 'johndoe@example.com',
        name: 'New John Doe',
        bio: 'A new software developer',
        profileUrl: 'http://example.com/newprofile.jpg',
        id: 2,
      },
    });
  });

  it('should return an error if no fields are provided for update', async () => {
    const req = {
      user: { userId: 2 },
      body: {},
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await patchUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'At least one field is required to update' });
  });

  it('should return an error if user ID is missing', async () => {
    const req = {
      user: { userId: undefined },
      body: {
        username: 'newjohndoe',
        password: 'NewPassword123!',
        name: 'New John Doe',
        bio: 'A new software developer',
        profilePictureUrl: 'http://example.com/newprofile.jpg',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await patchUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'User ID is required' });
  });

  it('should return an error if trying to update the base user', async () => {
    const req = {
      user: { userId: 1 },
      body: {
        username: 'newjohndoe',
        password: 'NewPassword123!',
        name: 'New John Doe',
        bio: 'A new software developer',
        profilePictureUrl: 'http://example.com/newprofile.jpg',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await patchUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cannot update the base user' });
  });

  it('should return an error if password does not meet constraints', async () => {
    const req = {
      user: { userId: 2 },
      body: {
        password: 'short',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await patchUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Password does not meet constraints' });
  });

  it('should return an error if existing user not found', async () => {
    const req = {
      user: { userId: 2 },
      body: {
        username: 'newjohndoe',
        password: 'NewPassword123!',
        name: 'New John Doe',
        bio: 'A new software developer',
        profilePictureUrl: 'http://example.com/newprofile.jpg',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValueOnce(null),
    } as unknown as IDatabase<object>;

    await patchUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Existing user not found' });
  });

  it('should return an error if username already exists', async () => {
    const req = {
      user: { userId: 2 },
      body: {
        username: 'existinguser',
        password: 'NewPassword123!',
        name: 'New John Doe',
        bio: 'A new software developer',
        profilePictureUrl: 'http://example.com/newprofile.jpg',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockRejectedValueOnce(new Error('duplicate key value violates unique constraint')),
    } as unknown as IDatabase<object>;

    await patchUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Username already exists' });
  });

  it('should return an error if there is a server error', async () => {
    const req = {
      user: { userId: 2 },
      body: {
        username: 'newjohndoe',
        password: 'NewPassword123!',
        name: 'New John Doe',
        bio: 'A new software developer',
        profilePictureUrl: 'http://example.com/newprofile.jpg',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockRejectedValueOnce(new Error('Database error')),
    } as unknown as IDatabase<object>;

    await patchUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
  });
});
