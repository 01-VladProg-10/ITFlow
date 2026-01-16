import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import ProgSettings from "./ProgSettings.tsx";

describe("ProgSettings", () => {
  it("toggles edit mode for profile fields", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ProgSettings />
      </MemoryRouter>
    );

    const firstName = screen.getAllByRole("textbox")[0];
    expect(firstName).toBeDisabled();
    expect(firstName).toHaveValue("-");

    await user.click(screen.getByRole("button", { name: /Edytuj/i }));

    expect(firstName).toBeEnabled();
    expect(screen.getByRole("button", { name: /Zapisz/i })).toBeInTheDocument();
  });
});
