import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextFunction, Response } from "express";
import { getMessageThreads } from "../src/getMessageThreads";
import { IDatabase } from "pg-promise";
import { AuthenticatedRequest } from "../../lib/src/auth";

describe("Get all threads for user", () => {
  let res: Response;
  let next: NextFunction;
  let db: IDatabase<object>;

  const listing_obj = {
    listing_id: 1,
    other_participant: {
      user_id: 2,
      name: "John Doe",
      profile_pic_url: "https://example.com/johndoe.jpg",
    },
    last_message: {
      sender_id: 1,
      receiver_id: 2,
      listing_id: 1,
      content: "hi i want to buy your couch",
      created_at: new Date(),
    },
  };

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
    db = {
      query: vi.fn().mockImplementationOnce(() => Promise.resolve(listing_obj)),
    } as unknown as IDatabase<object>;
  });

  it("should retrieve all of a user's threads", async () => {
    const req = {
      body: { num_items: "10", offset: "0" },
      user: { userId: 1 },
    } as unknown as AuthenticatedRequest;

    await getMessageThreads(req, res, db);
    expect(res.json).toHaveBeenCalledWith(listing_obj);
  });

  it("should fail on error", async () => {
    const req = {
      body: { num_items: "10", offset: "0" },
    } as unknown as AuthenticatedRequest;

    db.query = vi
      .fn()
      .mockImplementationOnce(() =>
        Promise.reject(new Error("Failed to fetch threads"))
      );
    await getMessageThreads(req, res, db);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
