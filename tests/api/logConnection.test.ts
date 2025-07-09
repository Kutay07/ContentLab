// @ts-nocheck
import { POST, GET } from "../../src/app/api/log-connection/route";
import { vol } from "memfs";

jest.mock("fs", () => require("memfs").fs);

describe("API /api/log-connection", () => {
  beforeEach(() => {
    vol.reset();
  });

  it("log ekler ve geri okur", async () => {
    const log = {
      timestamp: Date.now(),
      event: "connect",
      user: "user1",
      appId: "test-app",
    };

    // POST
    const postReq = new Request("http://localhost/api/log-connection", {
      method: "POST",
      body: JSON.stringify(log),
      headers: { "Content-Type": "application/json" },
    });
    const postRes = await POST(postReq);
    expect(postRes.status).toBe(201);

    // GET
    const getReq = new Request("http://localhost/api/log-connection?limit=10");
    const getRes = await GET(getReq);
    expect(getRes.status).toBe(200);
    const data = await getRes.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].event).toBe("connect");
  });
});
