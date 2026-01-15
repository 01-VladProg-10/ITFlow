import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import KontaktUser from "./KontaktUser";

describe("KontaktUser", () => {
  it("renders contact form fields", () => {
    render(
      <MemoryRouter>
        <KontaktUser />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /Formularz kontaktowy/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/imi/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nazw/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/wiadomo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Wy/i })).toBeInTheDocument();
  });
});
