import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import OrderFilesPage from "./OrderFilesPage";
import { fetchOrders } from "../api/orders";
import {
  buildDownloadUrl,
  fetchOrderFiles,
  sendFilesToClient,
} from "../api/orderFiles";

vi.mock("./OrdersPage", () => ({
  Sidebar: () => <aside data-testid="sidebar" />,
}));

vi.mock("../api/orders", () => ({
  fetchOrders: vi.fn(),
}));

vi.mock("../api/orderFiles", () => ({
  fetchOrderFiles: vi.fn(),
  sendFilesToClient: vi.fn(),
  buildDownloadUrl: vi.fn(),
}));

const orders = [
  {
    id: 1,
    title: "Order A",
    description: "Example",
    status: "new",
    developer: null,
    manager: null,
  },
];

const files = [
  {
    id: 10,
    order: 1,
    name: "spec.pdf",
    size: 1024 * 1024,
    url: "http://example.com/spec.pdf",
  },
  {
    id: 11,
    order: 1,
    name: "design.zip",
    size: 5 * 1024 * 1024,
    url: "http://example.com/design.zip",
  },
];

const fetchOrdersMock = vi.mocked(fetchOrders);
const fetchOrderFilesMock = vi.mocked(fetchOrderFiles);
const sendFilesToClientMock = vi.mocked(sendFilesToClient);
const buildDownloadUrlMock = vi.mocked(buildDownloadUrl);

const renderPage = (role: "client" | "programmer" | "manager", orderId = 1) =>
  render(
    <MemoryRouter initialEntries={[`/orders/${orderId}/files`]}>
      <Routes>
        <Route
          path="/orders/:orderId/files"
          element={<OrderFilesPage role={role} />}
        />
      </Routes>
    </MemoryRouter>
  );

const renderPath = (role: "client" | "programmer" | "manager", path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/orders/:orderId/files"
          element={<OrderFilesPage role={role} />}
        />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
  fetchOrdersMock.mockResolvedValue(orders);
  fetchOrderFilesMock.mockResolvedValue(files);
});

describe("OrderFilesPage", () => {
  it("shows loading while fetching", () => {
    fetchOrdersMock.mockReturnValue(new Promise(() => {}));
    fetchOrderFilesMock.mockReturnValue(new Promise(() => {}));

    renderPage("manager");

    expect(screen.getByText(/adowanie/)).toBeInTheDocument();
  });

  it("renders order details and files", async () => {
    renderPage("manager");

    expect(await screen.findByText("Pliki")).toBeInTheDocument();
    expect(screen.getByText("spec.pdf")).toBeInTheDocument();
    expect(screen.getByText("1.0 MB")).toBeInTheDocument();
  });

  it("shows error when fetch fails", async () => {
    fetchOrdersMock.mockRejectedValue(new Error("nope"));

    renderPage("manager");

    expect(await screen.findByText(/pobr/i)).toBeInTheDocument();
  });

  it("shows error when orderId is invalid", async () => {
    renderPath("manager", "/orders/abc/files");

    expect(
      await screen.findByText(/Nieprawidłowe ID zamówienia/i)
    ).toBeInTheDocument();
  });

  it("shows empty state when no files returned", async () => {
    fetchOrderFilesMock.mockResolvedValue([]);

    renderPage("client");

    expect(
      await screen.findByText(/Brak plików/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /zaznacz wszystkie/i })
    ).not.toBeInTheDocument();
  });

  it("enables send and calls API for manager", async () => {
    const user = userEvent.setup();

    renderPage("manager");
    await screen.findByText("Pliki");

    const sendButton = screen.getByRole("button", { name: /klientowi/i });
    expect(sendButton).toBeDisabled();

    await user.click(
      screen.getByRole("button", { name: /zaznacz wszystkie/i })
    );

    expect(sendButton).toBeEnabled();
    await user.click(sendButton);

    await waitFor(() =>
      expect(sendFilesToClientMock).toHaveBeenCalledWith(1, [10, 11])
    );
    expect(await screen.findByText(/Pliki zost/i)).toBeInTheDocument();
  });

  it("shows error message when send fails", async () => {
    const user = userEvent.setup();
    sendFilesToClientMock.mockRejectedValue(new Error("nope"));

    renderPage("manager");
    await screen.findByText("Pliki");

    await user.click(
      screen.getByRole("button", { name: /zaznacz wszystkie/i })
    );
    await user.click(screen.getByRole("button", { name: /klientowi/i }));

    expect(
      await screen.findByText(/Nie udało się wysłać/i)
    ).toBeInTheDocument();
  });

  it("toggles a single checkbox and enables download", async () => {
    const user = userEvent.setup();

    renderPage("client");
    await screen.findByText("Pliki");

    const downloadButton = screen.getByRole("button", { name: /pobierz/i });
    expect(downloadButton).toBeDisabled();

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);

    expect(downloadButton).toBeEnabled();
  });

  it("does not build download url when nothing selected", async () => {
    const user = userEvent.setup();
    buildDownloadUrlMock.mockReturnValue("http://download");

    renderPage("client");
    await screen.findByText("Pliki");

    const downloadButton = screen.getByRole("button", { name: /pobierz/i });
    expect(downloadButton).toBeDisabled();

    await user.click(downloadButton);

    expect(buildDownloadUrlMock).not.toHaveBeenCalled();
  });

  it("builds download url and opens new window", async () => {
    const user = userEvent.setup();
    const openSpy = vi
      .spyOn(window, "open")
      .mockImplementation(() => null);

    buildDownloadUrlMock.mockReturnValue("http://download");

    renderPage("client");
    await screen.findByText("Pliki");

    await user.click(
      screen.getByRole("button", { name: /zaznacz wszystkie/i })
    );
    await user.click(screen.getByRole("button", { name: /pobierz/i }));

    expect(buildDownloadUrlMock).toHaveBeenCalledWith(1, [10, 11]);
    expect(openSpy).toHaveBeenCalledWith("http://download", "_blank");

    openSpy.mockRestore();
  });

  it("shows upload for programmer and hides manager action for client", async () => {
    const { unmount } = renderPage("programmer");
    await screen.findByText("Pliki");

    expect(
      screen.getByRole("button", { name: /dodaj plik/i })
    ).toBeInTheDocument();

    unmount();

    renderPage("client");
    await screen.findByText("Pliki");

    expect(
      screen.queryByRole("button", { name: /klientowi/i })
    ).not.toBeInTheDocument();
  });
});
