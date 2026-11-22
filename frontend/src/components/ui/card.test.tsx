import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";

describe("Card", () => {
  it("renders correctly", () => {
    const { container } = render(<Card>Card content</Card>);
    expect(screen.getByText(/card content/i)).toBeInTheDocument();
    expect(container.querySelector('[data-slot="card"]')).toHaveAttribute("data-slot", "card");
  });

  it("renders with default size", () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.querySelector('[data-slot="card"]')).toHaveAttribute("data-size", "default");
  });

  it("renders with small size", () => {
    const { container } = render(<Card size="sm">Small card</Card>);
    expect(container.querySelector('[data-slot="card"]')).toHaveAttribute("data-size", "sm");
  });

  it("renders all card parts together", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Main content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );

    expect(screen.getByText(/title/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/main content/i)).toBeInTheDocument();
    expect(screen.getByText(/footer content/i)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Card className="custom-class">Custom</Card>);
    expect(container.querySelector('[data-slot="card"]')).toHaveClass("custom-class");
  });
});

describe("CardTitle", () => {
  it("renders correctly", () => {
    render(<CardTitle>My Title</CardTitle>);
    expect(screen.getByText(/my title/i)).toHaveAttribute("data-slot", "card-title");
  });
});

describe("CardDescription", () => {
  it("renders correctly", () => {
    render(<CardDescription>My Description</CardDescription>);
    expect(screen.getByText(/my description/i)).toHaveAttribute("data-slot", "card-description");
  });
});
