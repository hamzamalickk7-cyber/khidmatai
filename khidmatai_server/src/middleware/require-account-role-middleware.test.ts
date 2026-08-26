import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { ApplicationError } from "../shared/application-error.js";
import { requireAccountRoleMiddleware } from "./require-account-role-middleware.js";

function buildRequestWithRole(role: string | undefined): Request {
  return { authenticatedSession: role ? { user: { role } } : undefined } as unknown as Request;
}

describe("requireAccountRoleMiddleware", () => {
  it("calls next() with no error when the authenticated role is permitted", () => {
    const nextFunction: NextFunction = vi.fn();
    requireAccountRoleMiddleware("admin", "support")(buildRequestWithRole("admin"), {} as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledWith();
  });

  it("rejects a role that is authenticated but not in the permitted list", () => {
    const nextFunction: NextFunction = vi.fn();
    requireAccountRoleMiddleware("admin")(buildRequestWithRole("provider"), {} as Response, nextFunction);
    const forwardedError = (nextFunction as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(forwardedError).toBeInstanceOf(ApplicationError);
    expect((forwardedError as ApplicationError).httpStatusCode).toBe(403);
  });

  it("rejects a request with no authenticated session at all", () => {
    const nextFunction: NextFunction = vi.fn();
    requireAccountRoleMiddleware("admin", "support", "provider", "customer")(buildRequestWithRole(undefined), {} as Response, nextFunction);
    const forwardedError = (nextFunction as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(forwardedError).toBeInstanceOf(ApplicationError);
    expect((forwardedError as ApplicationError).httpStatusCode).toBe(403);
  });

  it("rejects support from an admin-only action, matching the documented read-only rule", () => {
    const nextFunction: NextFunction = vi.fn();
    requireAccountRoleMiddleware("admin")(buildRequestWithRole("support"), {} as Response, nextFunction);
    const forwardedError = (nextFunction as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(forwardedError).toBeInstanceOf(ApplicationError);
  });
});
