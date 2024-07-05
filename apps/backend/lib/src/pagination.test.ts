import { Request, Response, NextFunction } from "express";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { usePagination } from "./pagination";

describe("Pagination", () => {
  let res: Response;
  let next: NextFunction;
  beforeEach(() => {
    res = {} as Response;
    // @ts-expect-error Mock, it won't satisfy all conditions
    next = vi.fn() as NextFunction;
  });

  it("Uses default value if no query params", () => {
    const req = {
      body: {},
      query: {},
    } as unknown as Request;

    usePagination(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req).toHaveProperty("body");
    expect(req).toHaveProperty("body.num_items", 10);
    expect(req).toHaveProperty("body.offset", 0);
  });

  it("Uses default value if invalid num_items", () => {
    const req = {
      body: {},
      query: { num_items: "bananas!", offset: "4" },
    } as unknown as Request;

    usePagination(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req).toHaveProperty("body");
    expect(req).toHaveProperty("body.num_items", 10);
    expect(req).toHaveProperty("body.offset", 4);
  });

  it("Uses default value if invalid offset", () => {
    const req = {
      body: {},
      query: { num_items: "3", offset: "bananas!" },
    } as unknown as Request;

    usePagination(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req).toHaveProperty("body");
    expect(req).toHaveProperty("body.num_items", 3);
    expect(req).toHaveProperty("body.offset", 0);
  });

  it("Uses default value if invalid num_items and offset", () => {
    const req = {
      body: {},
      query: { num_items: "bananas!", offset: "bananas!" },
    } as unknown as Request;

    usePagination(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req).toHaveProperty("body");
    expect(req).toHaveProperty("body.num_items", 10);
    expect(req).toHaveProperty("body.offset", 0);
  });

  it("Accepts valid num_items and offset", () => {
    const req = {
      body: {},
      query: { num_items: "3", offset: "4" },
    } as unknown as Request;

    usePagination(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req).toHaveProperty("body");
    expect(req).toHaveProperty("body.num_items", 3);
    expect(req).toHaveProperty("body.offset", 4);
  });
});
