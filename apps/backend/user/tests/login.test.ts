import { describe, it, expect, vi, Mock } from 'vitest';
import { login } from '../src/login';
import { Response } from 'express';
import { IDatabase } from 'pg-promise';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest, create_token } from '../../lib/src/auth';

vi.mock('bcryptjs');
vi.mock('../../lib/src/auth', () => ({
  create_token: vi.fn(),
}));

describe('Login Endpoint', () => {
  it('should login a user successfully', async () => {
    const req = {
      body: {
        email: 'johndoe@example.com',
        password: 'Password123!',
        totpCode: '123456',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValueOnce({
        user_id: 1,
        username: 'johndoe',
        email: 'johndoe@example.com',
        password: await bcrypt.hash('Password123!', 10),
        name: 'John Doe',
        bio: 'A software developer',
        profile_pic_url: 'http://example.com/profile.jpg',
        verified: true,
      }),
    } as unknown as IDatabase<object>;

    (bcrypt.compare as Mock).mockResolvedValueOnce(true);
    (create_token as Mock).mockReturnValue('mockToken');

    await login(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      userID: 1,
      username: 'johndoe',
      name: 'John Doe',
      email: 'johndoe@example.com',
      bio: 'A software developer',
      profileUrl: 'http://example.com/profile.jpg',
    });
    expect(res.cookie).toHaveBeenCalledWith('authorization', 'mockToken', {
      httpOnly: true,
      sameSite: 'strict',
    });
  });

  it('should return an error if email or password is missing', async () => {
    const req = {
      body: {
        email: '',
        password: '',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await login(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email and password are required' });
  });

  it('should return an error if email or password is invalid', async () => {
    const req = {
      body: {
        email: 'johndoe@example.com',
        password: 'wrongPassword',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValueOnce({
        user_id: 1,
        username: 'johndoe',
        email: 'johndoe@example.com',
        password: await bcrypt.hash('Password123!', 10),
        name: 'John Doe',
        bio: 'A software developer',
        profile_pic_url: 'http://example.com/profile.jpg',
        verified: true,
      }),
    } as unknown as IDatabase<object>;

    (bcrypt.compare as Mock).mockResolvedValueOnce(false);

    await login(req, res, db);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email or password' });
  });

  it('should return an error if user is not verified', async () => {
    const req = {
      body: {
        email: 'johndoe@example.com',
        password: 'Password123!',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValueOnce({
        user_id: 1,
        username: 'johndoe',
        email: 'johndoe@example.com',
        password: await bcrypt.hash('Password123!', 10),
        name: 'John Doe',
        bio: 'A software developer',
        profile_pic_url: 'http://example.com/profile.jpg',
        verified: false,
      }),
    } as unknown as IDatabase<object>;

    (bcrypt.compare as Mock).mockResolvedValueOnce(true);

    await login(req, res, db);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'User is not verified' });
  });

  it('should return an error if there is a server error', async () => {
    const req = {
      body: {
        email: 'johndoe@example.com',
        password: 'Password123!',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockRejectedValueOnce(new Error('Database error')),
    } as unknown as IDatabase<object>;

    await login(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
  });
});
