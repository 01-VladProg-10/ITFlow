import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./auth", () => ({
  API_BASE: "http://example.test/api",
  apiFetch: vi.fn(),
}));

import { apiFetch, API_BASE } from "./auth.ts";
import { createOrder, fetchOrders } from "./orders.ts";

const apiFetchMock = vi.mocked(apiFetch);

describe("orders api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("fetchOrders calls API and returns data", async () => {
    const response = {
      ok: true,
      json: vi.fn().mockResolvedValue([{ id: 1 }]),
    };
    apiFetchMock.mockResolvedValue(response as any);

    const data = await fetchOrders();

    expect(apiFetchMock).toHaveBeenCalledWith(`${API_BASE}/orders/`, {
      method: "GET",
    });
    expect(data).toEqual([{ id: 1 }]);
  });

  it("fetchOrders throws on error response", async () => {
    const response = {
      ok: false,
      json: vi.fn().mockResolvedValue({ error: "nope" }),
    };
    apiFetchMock.mockResolvedValue(response as any);

    await expect(fetchOrders()).rejects.toThrow(/error/i);
  });

  it("createOrder posts payload with defaults", async () => {
    const response = {
      ok: true,
      json: vi.fn().mockResolvedValue({ id: 2 }),
    };
    apiFetchMock.mockResolvedValue(response as any);

    await createOrder({ title: "T", description: "D" });

    const call = apiFetchMock.mock.calls[0];
    const body = JSON.parse((call[1] as RequestInit).body as string);

    expect(call[0]).toBe(`${API_BASE}/orders/`);
    expect((call[1] as RequestInit).method).toBe("POST");
    expect(body).toEqual({
      title: "T",
      description: "D",
      status: "submitted",
      developer: null,
      manager: null,
    });
  });
});
