import { describe, it, expect, vi } from 'vitest';
import { createUser } from '../src/createUser';
import { Response } from 'express';
import { IDatabase } from 'pg-promise';
import { AuthenticatedRequest } from '../../lib/src/auth';

describe('Create User Endpoint', () => {
  it('should create a user successfully', async () => {
    const req = {
      body: {
        username: 'johndoe',
        password: 'Password123!',
        email: 'johndoe@uvic.ca',
        name: 'John Doe',
      },
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
        email: 'johndoe@uvic.ca',
        name: 'John Doe',
        bio: null,
        profile_pic_url: null,
      }),
    } as unknown as IDatabase<object>;

    await createUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      user_id: 1,
      username: 'johndoe',
      email: 'johndoe@uvic.ca',
      name: 'John Doe',
      bio: null,
      profile_pic_url: null,
    });
  });

  it('should return an error if parameters are missing', async () => {
    const req = {
      body: {
        username: 'johndoe',
        password: 'Password123!',
        email: '',
        name: 'John Doe',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await createUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Username, password, name and email are required',
    });
  });

  it('should return an error if the password does not meet constraints', async () => {
    const req = {
      body: {
        username: 'johndoe',
        password: 'pass',
        email: 'johndoe@uvic.ca',
        name: 'John Doe',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await createUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Password does not meet constraints',
    });
  });

  it('should return an error if user creation fails', async () => {
    const req = {
      body: {
        username: 'johndoe',
        password: 'Password123!',
        email: 'johndoe@uvic.ca',
        name: 'John Doe',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValueOnce(null),
    } as unknown as IDatabase<object>;

    await createUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'User not created',
    });
  });

  it('should return an error if there is a server error', async () => {
    const req = {
      body: {
        username: 'johndoe',
        password: 'Password123!',
        email: 'johndoe@uvic.ca',
        name: 'John Doe',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockRejectedValueOnce(new Error('Database error')),
    } as unknown as IDatabase<object>;

    await createUser(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Something went wrong',
    });
  });
});
