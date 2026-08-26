import { describe, expect, it, vi } from "vitest";
import supertest from "supertest";

vi.mock("./modules/authentication/authentication-http-handler.js", () => ({
  authenticationHttpHandler: (
    _request: unknown,
    response: { status: (code: number) => { json: (body: unknown) => void } },
  ) => response.status(501).json({ success: false }),
}));
vi.mock("./config/authentication-configuration.js", () => ({
  authenticationConfiguration: { api: { getSession: vi.fn().mockResolvedValue(null) } },
}));

describe("KhidmatAI Express API integration", () => {
  it("serves its public service identity without exposing Express", async () => {
    const { createKhidmatAiExpressApplication } = await import("./app.js");
    const response = await supertest(createKhidmatAiExpressApplication()).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, data: { service: "khidmatai-server" } });
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("rejects unauthenticated access to private customer profiles", async () => {
    const { createKhidmatAiExpressApplication } = await import("./app.js");
    const response = await supertest(createKhidmatAiExpressApplication()).get("/api/v1/customer-profile");
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
  });

  it("returns a structured 404 for unknown versioned endpoints", async () => {
    const { createKhidmatAiExpressApplication } = await import("./app.js");
    const response = await supertest(createKhidmatAiExpressApplication()).get("/api/v1/not-real");
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
