import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextFunction, Response } from "express";
import { getMessages, useValidateGetMessages } from "../src/getMessages";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

describe("Get all threads for user", () => {
  let res: Response;
  let next: NextFunction;

  const content = "hi i want to buy your couch";
  const sender_id = 1;
  const receiver_id = 2;
  const listing_id = 1;
  const created_at = new Date();

  beforeEach(() => {
    // @ts-expect-error Mock, it won't satisfy all conditions
    res = {
      status: vi.fn(() => {
        return { json: vi.fn() };
      }),
      json: vi.fn(),
    } as Response;
    // @ts-expect-error Mock, it won't satisfy all conditions
    next = vi.fn() as NextFunction;
  });

  it("should retrieve all messages in a thread", async () => {
    const req = {
      params: { receiver_id, listing_id },
      body: { num_items: "10", offset: "0" },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const db = {
      oneOrNone: vi.fn().mockImplementation(() =>
        Promise.resolve({
          seller_id: receiver_id,
        })
      ),
      query: vi.fn().mockImplementation(() =>
        Promise.resolve([
          {
            message_body: content,
            sender_id,
            receiver_id,
            listing_id,
            created_at,
          },
        ])
      ),
    } as unknown as IDatabase<object>;

    await useValidateGetMessages(req, res, next, db);
    expect(next).toHaveBeenCalledTimes(1);

    await getMessages(req, res, db);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith([
      {
        message_body: content,
        sender_id,
        receiver_id,
        listing_id,
        created_at,
      },
    ]);
  });

  it("should fail with missing fields", async () => {
    const req = {
      params: { listing_id },
      body: { num_items: "10", offset: "0" },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;
    const db = {
      oneOrNone: vi.fn().mockImplementation(() =>
        Promise.resolve({
          seller_id: 1,
        })
      ),
    } as unknown as IDatabase<object>;

    await useValidateGetMessages(req, res, next, db);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should fail when listing not found", async () => {
    const req = {
      params: { receiver_id, listing_id },
      body: { num_items: "10", offset: "0" },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;
    const db = {
      oneOrNone: vi.fn().mockImplementation(() => Promise.resolve(null)),
    } as unknown as IDatabase<object>;

    await useValidateGetMessages(req, res, next, db);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should fail when user is not authorized", async () => {
    const req = {
      params: { receiver_id, listing_id },
      body: { num_items: "10", offset: "0" },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;
    const db = {
      oneOrNone: vi.fn().mockImplementation(() =>
        Promise.resolve({
          seller_id: 100,
        })
      ),
    } as unknown as IDatabase<object>;

    await useValidateGetMessages(req, res, next, db);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
