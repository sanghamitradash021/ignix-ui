import { describe, it, expect } from "vitest";
import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  FeatureCard,
  StatCard
} from "./index";
import { vi } from "vitest";

vi.mock("framer-motion", () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div {...props} ref={ref}>{children}</div>
    )),
    h3: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <h3 {...props} ref={ref}>{children}</h3>
    )),
    p: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <p {...props} ref={ref}>{children}</p>
    )),
  },
}));

describe("Card Components", () => {
  describe("Card", () => {
    it("renders children correctly", () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });

    it("applies variant classes correctly", () => {
      const { container } = render(<Card variant="glass">Glass Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("bg-white/10");
      expect(card).toHaveClass("backdrop-blur-xl");
    });

    it("applies interactive classes correctly", () => {
      const { container } = render(<Card interactive="lift">Interactive Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("hover:-translate-y-2");
      expect(card).toHaveClass("cursor-pointer");
    });

    it("forwards ref to the motion.div", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Ref Card</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("renders shimmer effect for premium, glass, and gradient variants", () => {
      const { container } = render(<Card variant="premium">Premium Card</Card>);
      const shimmer = container.querySelector(".absolute.inset-0.bg-gradient-to-r");
      expect(shimmer).toBeInTheDocument();
    });
  });

  describe("Card Sub-components", () => {
    it("CardHeader renders children and variant classes", () => {
      render(<CardHeader variant="spacious">Header</CardHeader>);
      expect(screen.getByText("Header")).toHaveClass("p-8");
    });

    it("CardContent renders children and variant classes", () => {
      render(<CardContent variant="flush">Content</CardContent>);
      expect(screen.getByText("Content")).toHaveClass("p-0");
    });

    it("CardFooter renders children and justify classes", () => {
      render(<CardFooter justify="between">Footer</CardFooter>);
      expect(screen.getByText("Footer")).toHaveClass("justify-between");
    });
  });

  describe("Specialized Cards", () => {
    describe("FeatureCard", () => {
      it("renders icon and children", () => {
        const Icon = () => <svg data-testid="feature-icon" />;
        render(
          <FeatureCard icon={<Icon />}>
            <h3>Feature Title</h3>
            <p>Feature text</p>
          </FeatureCard>
        );
        expect(screen.getByTestId("feature-icon")).toBeInTheDocument();
        expect(screen.getByText("Feature Title")).toBeInTheDocument();
        expect(screen.getByText("Feature text")).toBeInTheDocument();
      });
    });

    describe("StatCard", () => {
      it("renders value and label", () => {
        render(<StatCard value="1,234" label="Total Users" />);
        expect(screen.getByText("1,234")).toBeInTheDocument();
        expect(screen.getByText("Total Users")).toBeInTheDocument();
      });

      it("renders trend indicators correctly (up)", () => {
        render(<StatCard value="100" label="Stats" trend="up" trendValue="+12%" />);
        expect(screen.getByText("↗ +12%")).toHaveClass("text-success");
      });

      it("renders trend indicators correctly (down)", () => {
        render(<StatCard value="100" label="Stats" trend="down" trendValue="-5%" />);
        expect(screen.getByText("↘ -5%")).toHaveClass("text-destructive");
      });

      it("renders trend indicators correctly (neutral)", () => {
        render(<StatCard value="100" label="Stats" trend="neutral" trendValue="0%" />);
        expect(screen.getByText("0%")).toHaveClass("text-muted-foreground");
      });
    });
  });
});
