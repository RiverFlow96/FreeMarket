import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("Input", () => {
  it("renders correctly", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
  });

  it("accepts value", async () => {
    const user = userEvent.setup();
    render(<Input />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Hello World");
    expect(input).toHaveValue("Hello World");
  });

  it("handles onChange", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Test");
    expect(handleChange).toHaveBeenCalled();
  });

  it("can be disabled", () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText(/disabled/i)).toBeDisabled();
  });

  it("handles different types", () => {
    render(<Input type="email" placeholder="email" />);
    expect(screen.getByPlaceholderText(/email/i)).toHaveAttribute("type", "email");
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-class");
  });

  it("shows invalid state", () => {
    render(<Input aria-invalid={true} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
