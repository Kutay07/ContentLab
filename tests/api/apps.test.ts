// @ts-nocheck
import handler from "../../src/pages/api/apps/index";
import { vol } from "memfs";
import path from "path";

// fs yerine memfs kullan
jest.mock("fs", () => require("memfs").fs);

describe("API /api/apps", () => {
  const sampleApp = {
    id: "test-app",
    name: "Test App",
    description: "Test açıklama",
    status: "active",
    supabase: {
      url: "https://xyz.supabase.co",
      anonKey: "abcdefghijklmnopqrstuvwxyz",
      projectId: "xyz",
    },
    icon: "🧪",
    color: "blue",
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };

  beforeEach(() => {
    vol.reset();
  });

  const createRes = () => {
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res;
  };

  it("başlangıçta boş dizi döner", async () => {
    const req: any = { method: "GET" };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("POST ile eklenir ve GET ile alınır", async () => {
    const postReq: any = { method: "POST", body: sampleApp };
    const postRes = createRes();
    await handler(postReq, postRes);
    expect(postRes.status).toHaveBeenCalledWith(201);

    const getReq: any = { method: "GET" };
    const getRes = createRes();
    await handler(getReq, getRes);
    expect(getRes.status).toHaveBeenCalledWith(200);
    expect(getRes.json).toHaveBeenCalledWith([sampleApp]);
  });
});
