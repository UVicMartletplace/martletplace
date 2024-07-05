import { describe, it, expect, vi } from 'vitest';
import { logout } from '../src/logout';
import { Request, Response } from 'express';

describe('Logout Endpoint', () => {
  it('should log out a user successfully', async () => {
    const req = {} as unknown as Request;

    const res = {
      clearCookie: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    await logout(req, res, {} as any);

    expect(res.clearCookie).toHaveBeenCalledWith('authorization');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Logged out' });
  });
});
