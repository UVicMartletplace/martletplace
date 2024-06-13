import { Request, Response, NextFunction } from 'express';
import { getUserById } from '../index';

jest.mock('pg-promise', () => {
  return () => {
    return {
      oneOrNone: jest.fn()
    };
  };
});

const pgp = require('pg-promise')();

describe('DELETE /api/user/:id', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: { id: '4' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    next = jest.fn();
  });

  it('should return a user object for a valid ID (passing test)', async () => {
    pgp.oneOrNone.mockResolvedValue({
        user_id: 5,
        username: 'user5',
        email: 'user5@example.com',
        password: 'password5',
        name: 'User Five',
        bio: 'Bio for user five',
        profile_pic_url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Casper',
        verified: true
    });

    await getUserById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
        user_id: 5,
        username: 'user5',
        email: 'user5@example.com',
        password: 'password5',
        name: 'User Five',
        bio: 'Bio for user five',
        profile_pic_url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Casper',
        verified: true
    });
  });

  it('should return a 404 status for an invalid ID (failing test)', async () => {
    pgp.oneOrNone.mockResolvedValue(null);

    req.params = { id: '9999' };

    await getUserById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'User not found'
    });
  });
});