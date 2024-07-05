import { describe, it, expect, vi, Mock } from 'vitest';
import { confirmEmail } from '../src/confirmEmail';
import { Response } from 'express';
import { IDatabase } from 'pg-promise';
import { verify } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../../lib/src/auth';

vi.mock('jsonwebtoken');

describe('Confirm Email Endpoint', () => {
  it('should verify the email successfully', async () => {
    const req = {
      body: {
        code: 'validToken',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      none: vi.fn().mockResolvedValueOnce(undefined),
    } as unknown as IDatabase<object>;

    (verify as Mock).mockReturnValueOnce({ userId: 2 });

    await confirmEmail(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email verified' });
  });

  it('should return an error if code is missing', async () => {
    const req = {
      body: {},
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      none: vi.fn(),
    } as unknown as IDatabase<object>;

    await confirmEmail(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Code is required' });
  });

  it('should return an error if code is invalid', async () => {
    const req = {
      body: {
        code: 'invalidToken',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      none: vi.fn(),
    } as unknown as IDatabase<object>;

    (verify as Mock).mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    await confirmEmail(req, res, db);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid code' });
  });

  it('should return an error if user ID is not in code', async () => {
    const req = {
      body: {
        code: 'tokenWithoutUserId',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      none: vi.fn(),
    } as unknown as IDatabase<object>;

    (verify as Mock).mockReturnValueOnce({});

    await confirmEmail(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID in code' });
  });

  it('should return an error if there is a server error', async () => {
    const req = {
      body: {
        code: 'validToken',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      none: vi.fn().mockRejectedValueOnce(new Error('Database error')),
    } as unknown as IDatabase<object>;

    (verify as Mock).mockReturnValueOnce({ userId: 2 });

    await confirmEmail(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email could not be confirmed' });
  });
});
