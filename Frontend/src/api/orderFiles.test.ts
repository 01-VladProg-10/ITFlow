import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./auth", () => ({
  API_BASE: "http://example.test/api",
  apiFetch: vi.fn(),
}));

import { apiFetch, API_BASE } from "./auth.ts";
import {
  buildDownloadUrl,
  fetchOrderFiles,
  sendFilesToClient,
} from "./orderFiles.ts";

const apiFetchMock = vi.mocked(apiFetch);

describe("orderFiles api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("fetchOrderFiles calls API and returns data", async () => {
    const response = {
      ok: true,
      json: vi.fn().mockResolvedValue([{ id: 1 }]),
    };
    apiFetchMock.mockResolvedValue(response as any);

    const data = await fetchOrderFiles(10);

    expect(apiFetchMock).toHaveBeenCalledWith(
      `${API_BASE}/orders/10/files/`,
      { method: "GET" }
    );
    expect(data).toEqual([{ id: 1 }]);
  });

  it("sendFilesToClient posts file ids", async () => {
    const response = {
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    };
    apiFetchMock.mockResolvedValue(response as any);

    await sendFilesToClient(3, [7, 8]);

    const call = apiFetchMock.mock.calls[0];
    const body = JSON.parse((call[1] as RequestInit).body as string);

    expect(call[0]).toBe(`${API_BASE}/orders/3/files/send-to-client/`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body).toEqual({ file_ids: [7, 8] });
  });

  it("buildDownloadUrl builds query params", () => {
    const url = buildDownloadUrl(5, [1, 2]);

    expect(url).toBe(
      `${API_BASE}/orders/5/files/download/?file_ids=1&file_ids=2`
    );
  });
});
