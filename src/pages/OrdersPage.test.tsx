import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { OrdersPage } from "./OrdersPage";
import { createOrder, fetchOrders } from "../api/orders";

vi.mock("../api/orders", () => ({
  fetchOrders: vi.fn(),
  createOrder: vi.fn(),
}));

const fetchOrdersMock = vi.mocked(fetchOrders);
const createOrderMock = vi.mocked(createOrder);

const renderOrdersPage = (
  role: "client" | "manager" | "programmer",
  initialEntries: string[] = ["/orders"]
) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <OrdersPage role={role} />
    </MemoryRouter>
  );

const orders = [
  {
    id: 1,
    title: "Alpha",
    description: "First order",
    status: "new",
    developer: null,
    manager: null,
  },
  {
    id: 2,
    title: "Beta",
    description: "Second order",
    status: "in_progress",
    developer: null,
    manager: null,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  fetchOrdersMock.mockResolvedValue(orders);
});

describe("OrdersPage", () => {
  it("shows loading state while fetching", () => {
    fetchOrdersMock.mockReturnValue(new Promise(() => {}));

    renderOrdersPage("client");

    expect(screen.getByText(/adowanie/i)).toBeInTheDocument();
  });

  it("shows error when fetching fails", async () => {
    fetchOrdersMock.mockRejectedValue(new Error("nope"));

    renderOrdersPage("client");

    expect(await screen.findByText(/pobra/i)).toBeInTheDocument();
  });

  it("renders list and details link for manager role", async () => {
    renderOrdersPage("manager");

    expect((await screen.findAllByText("Alpha")).length).toBeGreaterThan(0);

    const links = screen.getAllByRole("link", { name: /zobacz/i });
    expect(
      links.some((link) => link.getAttribute("href") === "/manager-orders/1/files")
    ).toBe(true);
  });

  it("filters orders by search query", async () => {
    const user = userEvent.setup();
    renderOrdersPage("client");

    await screen.findAllByText("Alpha");

    const search = screen.getByPlaceholderText(
      "Szukaj po tytule, opisie lub statusie..."
    );
    await user.type(search, "Beta");

    expect((await screen.findAllByText("Beta")).length).toBeGreaterThan(0);
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });

  it("opens create form for client and submits new order", async () => {
    const user = userEvent.setup();
    createOrderMock.mockResolvedValue({
      id: 3,
      title: "Gamma",
      description: "New order",
      status: "submitted",
      developer: null,
      manager: null,
    });

    renderOrdersPage("client");
    await screen.findAllByText("Alpha");

    await user.click(screen.getByRole("button", { name: /Nowe/i }));

    const textboxes = screen.getAllByRole("textbox");
    const titleInput = textboxes[1];
    const descriptionInput = textboxes[2];
    await user.type(titleInput, "Gamma");
    await user.type(descriptionInput, "New order");

    await user.click(screen.getByRole("button", { name: /Złóż/i }));

    await waitFor(() =>
      expect(createOrderMock).toHaveBeenCalledWith({
        title: "Gamma",
        description: "New order",
      })
    );

    expect(await screen.findByText(/utworzone/i)).toBeInTheDocument();
    expect((await screen.findAllByText("Gamma")).length).toBeGreaterThan(0);
  });

  it("shows create form on ?new=1 for client", async () => {
    renderOrdersPage("client", ["/orders?new=1"]);

    expect(await screen.findByRole("button", { name: /Anuluj/i })).toBeInTheDocument();
  });

  it("refreshes orders for manager", async () => {
    const user = userEvent.setup();
    renderOrdersPage("manager");

    await screen.findAllByText("Alpha");

    await user.click(screen.getByRole("button", { name: /Zamówienia/i }));

    expect(fetchOrdersMock).toHaveBeenCalledTimes(2);
  });

  it("shows empty state when no orders", async () => {
    fetchOrdersMock.mockResolvedValue([]);

    renderOrdersPage("client");

    expect(await screen.findByText(/Brak/i)).toBeInTheDocument();
  });
});
