import { describe, it, expect, vi, Mock, beforeAll } from 'vitest';
import { createNewPassword } from '../src/createNewPassword';
import { Response, Request } from 'express';
import { IDatabase } from 'pg-promise';
import { verify } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

vi.mock('jsonwebtoken', () => ({
  verify: vi.fn(),
}));

vi.mock('bcryptjs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    hash: vi.fn().mockResolvedValue('hashedPassword'),
  };
});

describe('Create New Password Endpoint', () => {
  beforeAll(() => {
    process.env.JWT_PUBLIC_KEY = 'mockPublicKey';
  });

  it('should update the password successfully', async () => {
    const req = {
      body: {
        code: 'validToken',
        password: 'ValidPass123!',
      },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn()
        .mockResolvedValueOnce({ user_id: 5 })  // getUserQuery
        .mockResolvedValueOnce({ user_id: 5 }), // patchUserQuery
    } as unknown as IDatabase<object>;

    (verify as Mock).mockReturnValueOnce({ userId: { user_id: 5 } });

    await createNewPassword(req, res, db);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'User updated successfully' });
  });

  it('should return an error if code is missing', async () => {
    const req = {
      body: {},
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await createNewPassword(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Code is required' });
  });

  it('should return an error if code is invalid', async () => {
    const req = {
      body: {
        code: 'invalidToken',
        password: 'ValidPass123!',
      },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    (verify as Mock).mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    await createNewPassword(req, res, db);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid code' });
  });

  it('should return an error if user ID is missing from the code', async () => {
    const req = {
      body: {
        code: 'tokenWithoutUserId',
        password: 'ValidPass123!',
      },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    (verify as Mock).mockReturnValueOnce({});

    await createNewPassword(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'User ID is required' });
  });

  it('should return an error if user is not found', async () => {
    const req = {
      body: {
        code: 'validToken',
        password: 'ValidPass123!',
      },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn()
        .mockResolvedValueOnce(null), // getUserQuery
    } as unknown as IDatabase<object>;

    (verify as Mock).mockReturnValueOnce({ userId: { user_id: 5 } });

    await createNewPassword(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Existing user not found' });
  });

  it('should return an error if there is a server error', async () => {
    const req = {
      body: {
        code: 'validToken',
        password: 'ValidPass123!',
      },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockRejectedValueOnce(new Error('Database error')),
    } as unknown as IDatabase<object>;

    (verify as Mock).mockReturnValueOnce({ userId: { user_id: 2 } });

    await createNewPassword(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
  });

  it('should return an error if password does not meet constraints', async () => {
    const req = {
      body: {
        code: 'validToken',
        password: 'weakpass',
      },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    (verify as Mock).mockReturnValueOnce({ userId: { user_id: 5 } });

    await createNewPassword(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Password does not meet constraints' });
  });

  it('should return an error if trying to update the base user', async () => {
    const req = {
      body: {
        code: 'validToken',
        password: 'ValidPass123!',
      },
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    (verify as Mock).mockReturnValueOnce({ userId: { user_id: 1 } });

    await createNewPassword(req, res, db);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cannot update the base user' });
  });
});
