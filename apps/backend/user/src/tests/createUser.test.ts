import { Request, Response, NextFunction } from "express";
import { createUser } from "../index";
// import pgPromise from "pg-promise";
import { User } from "../models/user";


const pgp = require("pg-promise");

jest.mock("pg-promise", () => {
  const mockDb = {
    oneOrNone: jest.fn(),
  };
  return jest.fn(() => {
    return () => mockDb;
  });
});

const mockDb = pgp()();

// let pgp = jest.fn(() => ({
//     none: jest.fn(),
// }));

// const pgp = pgPromise();

describe("createUser", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            body: {
                username: "testuser",
                password: "Test@123",
                email: "testuser@example.com",
                name: "Test User",
                bio: "This is a test user.",
                profile_pic_url: "http://example.com/profile.jpg",
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        next = jest.fn();
    });

    it("should create a new user and return 201 status", async () => {
        const mockUser: User = {
            user_id: 1,
            username: "testuser",
            email: "testuser@example.com",
            password: "Test@123",
            name: "Test User",
            bio: "This is a test user.",
            profile_pic_url: "http://example.com/profile.jpg",
            verified: false,
            created_at: new Date(),
            modified_at: new Date(),
        };

        (mockDb.oneOrNone as jest.Mock).mockResolvedValue(mockUser);

        await createUser(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith(mockUser);
    });

    it("should return 400 if username, password, or email is missing", async () => {
        req.body = { username: "", password: "", email: "" };

        await createUser(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith("Username, password, and email are required");
    });

    it("should call next with an error if user is not created", async () => {
        (mockDb.oneOrNone as jest.Mock).mockResolvedValue(null);

        await createUser(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(new Error("User not created"));
    });

    it("should call next with an error if db operation fails", async () => {
        const error = new Error("Database error");
        (mockDb.oneOrNone as jest.Mock).mockRejectedValue(error);

        await createUser(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
