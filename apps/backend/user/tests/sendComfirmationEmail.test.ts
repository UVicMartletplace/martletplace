import { describe, it, expect, vi, Mock, beforeAll } from 'vitest';
import { sendConfirmationEmail } from '../src/sendConfirmationEmail';
import { Response } from 'express';
import { IDatabase } from 'pg-promise';
import axios from 'axios';
import { create_token } from '../../lib/src/auth';
import { AuthenticatedRequest } from '../../lib/src/auth';

vi.mock('axios');
vi.mock('../../lib/src/auth', () => ({
  create_token: vi.fn(),
}));

describe('Send Confirmation Email Endpoint', () => {
  beforeAll(() => {
    process.env.JWT_PUBLIC_KEY = 'mockPublicKey';
  });

  it('should send a confirmation email successfully', async () => {
    const req = {
      body: {
        email: 'user5@uvic.ca',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValueOnce({user_id: 5}),
    } as unknown as IDatabase<object>;

    (create_token as Mock).mockReturnValueOnce('mockToken');

    await sendConfirmationEmail(req, res, db);

    expect(db.oneOrNone).toHaveBeenCalledWith('SELECT user_id FROM users WHERE email = $1', ['user5@uvic.ca']);
    expect(create_token).toHaveBeenCalledWith({ userId: { user_id: 5 } }, "/api/user/confirm-email");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Verification email sent' });
  });

  it('should return an error if email is missing', async () => {
    const req = {
      body: {},
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn(),
    } as unknown as IDatabase<object>;

    await sendConfirmationEmail(req, res, db);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email is required' });
  });

  it('should return an error if user is not found', async () => {
    const req = {
      body: {
        email: 'user5@uvic.ca',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValueOnce(null),
    } as unknown as IDatabase<object>;

    await sendConfirmationEmail(req, res, db);

    expect(db.oneOrNone).toHaveBeenCalledWith('SELECT user_id FROM users WHERE email = $1', ['user5@uvic.ca']);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should return an error if there is a database error', async () => {
    const req = {
      body: {
        email: 'user5@uvic.ca',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockRejectedValueOnce(new Error('Database error')),
    } as unknown as IDatabase<object>;

    await sendConfirmationEmail(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong' });
  });

  it('should return an error if email sending fails', async () => {
    const req = {
      body: {
        email: 'user5@uvic.ca',
      },
    } as unknown as AuthenticatedRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    const db = {
      oneOrNone: vi.fn().mockResolvedValueOnce({ user_id: 2 }),
    } as unknown as IDatabase<object>;

    (create_token as Mock).mockReturnValueOnce('mockToken');
    (axios.post as Mock).mockRejectedValueOnce(new Error('Email sending error'));

    await sendConfirmationEmail(req, res, db);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Verification email could not be sent, please try again',
    });
  });
});
