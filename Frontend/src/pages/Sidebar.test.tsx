import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { Sidebar } from "./OrdersPage";

describe("Sidebar", () => {
  it("calls onClose when clicking overlay", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <Sidebar role="client" open onClose={onClose} />
      </MemoryRouter>
    );

    const overlay = container.querySelector('div[class*="bg-black"]');
    expect(overlay).not.toBeNull();

    await userEvent.click(overlay as Element);

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking nav link", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Sidebar role="client" open onClose={onClose} />
      </MemoryRouter>
    );

    const links = screen.getAllByRole("link", { name: /dashboard/i });
    await user.click(links[0]);

    expect(onClose).toHaveBeenCalled();
  });
});
