import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ManagerReports from "./ManagerReports.tsx";

describe("ManagerReports", () => {
  it("renders reports page content", () => {
    render(
      <MemoryRouter>
        <ManagerReports />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /Zg/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/raport/i)).toBeInTheDocument();
  });
});
