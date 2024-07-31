import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextFunction, Response } from "express";
import { createMessage, useValidateCreateMessage } from "../src/createMessage";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

describe("Create Message", () => {
  let res: Response;
  let next: NextFunction;
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
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should successfully create a new message", async () => {
    const content = "hi i want to buy your couch";
    const sender_id = 1;
    const receiver_id = 2;
    const listing_id = 1;
    const created_at = new Date();

    const req = {
      body: { sender_id, receiver_id, listing_id, content },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    let db = {
      oneOrNone: vi.fn().mockImplementation(() =>
        Promise.resolve({
          seller_id: receiver_id,
        })
      ),
    } as unknown as IDatabase<object>;
    await useValidateCreateMessage(req, res, next, db);
    expect(next).toHaveBeenCalledTimes(1);

    db = {
      oneOrNone: vi.fn().mockImplementation(() =>
        Promise.resolve({
          message_body: content,
          sender_id,
          receiver_id,
          listing_id,
          created_at,
        })
      ),
    } as unknown as IDatabase<object>;
    await createMessage(req, res, db);
    expect(res.json).toHaveBeenCalledWith({
      message_body: content,
      sender_id,
      receiver_id,
      listing_id,
      created_at,
    });
  });

  it("should fail to create a new message with missing parameters", async () => {
    const req = {
      body: {
        sender_id: 1,
        receiver_id: 2,
      },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    const db = {
      oneOrNone: vi.fn().mockImplementation(() => Promise.resolve()),
    } as unknown as IDatabase<object>;

    await useValidateCreateMessage(req, res, next, db);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
