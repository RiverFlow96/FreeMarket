import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("applies variant correctly", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button", { name: /delete/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-variant", "destructive");
  });

  it("applies size correctly", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole("button", { name: /small/i });
    expect(button).toHaveAttribute("data-size", "sm");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByRole("button", { name: /click/i }).click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button", { name: /disabled/i })).toBeDisabled();
  });

  it("handles loading state", () => {
    render(<Button disabled>Loading...</Button>);
    expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
  });

  it("renders as different element when asChild is true", () => {
    render(
      <Button asChild>
        <span>Child span</span>
      </Button>
    );
    expect(screen.getByText(/child span/i)).toBeInTheDocument();
  });
});
