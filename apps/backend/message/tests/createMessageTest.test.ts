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

    const db = {
      oneOrNone: vi.fn().mockImplementationOnce(() =>
        Promise.resolve({
          message_body: content,
          sender_id,
          receiver_id,
          listing_id,
          created_at,
        })
      ),
    } as unknown as IDatabase<object>;

    const req = {
      body: { sender_id, receiver_id, listing_id, content },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;
    useValidateCreateMessage(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    await createMessage(req, res, db);
    console.log("create message res", res);
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

    useValidateCreateMessage(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
