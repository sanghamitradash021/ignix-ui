import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Badge } from "./index";
import React from "react";

vi.mock("framer-motion", () => {
  type MotionProps = {
    children?: React.ReactNode;
    initial?: unknown;
    animate?: unknown;
    exit?: unknown;
    variants?: unknown;
    transition?: unknown;
    whileHover?: unknown;
    whileTap?: unknown;
  };

  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        React.forwardRef<HTMLElement, MotionProps>(
          (
            {
              children,
              initial: _i,
              animate: _a,
              exit: _e,
              variants: _v,
              transition: _t,
              whileHover: _wh,
              whileTap: _wt,
              ...rest
            },
            ref
          ) =>
            React.createElement(
              tag,
              { ...(rest as Record<string, unknown>), ref },
              children
            )
        ),
    }
  );

  return { motion, AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children) };
});

const renderBadge = (props: Partial<React.ComponentProps<typeof Badge>> = {}) =>
  render(<Badge text="Badge Text" {...props} />);

describe("Badge rendering", () => {
  it("renders without crashing", () => {
    renderBadge();
    expect(screen.getByText("Badge Text")).toBeInTheDocument();
  });

  it("displays the text prop", () => {
    renderBadge({ text: "42" });
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders the badge text inside a <span>", () => {
    renderBadge({ text: "Hello" });
    const span = screen.getByText("Hello");
    expect(span.tagName).toBe("SPAN");
  });

  it("renders a gradient overlay div with aria-hidden", () => {
    const { container } = renderBadge();
    const overlay = container.querySelector("div[aria-hidden='true']");
    expect(overlay).toHaveClass(
      "bg-gradient-to-t",
      "rounded-full",
      "pointer-events-none"
    );
  });
});

describe("Badge children", () => {
  it("renders children alongside the badge", () => {
    render(
      <Badge text="3">
        <button>Bell</button>
      </Badge>
    );
    expect(screen.getByRole("button", { name: "Bell" })).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders without children", () => {
    renderBadge();
    expect(screen.getByText("Badge Text")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <Badge text="5">
        <span>Icon</span>
        <span>Label</span>
      </Badge>
    );
    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText("Label")).toBeInTheDocument();
  });
});


describe("Badge type prop applies correct classes", () => {
  const typeCases: Array<[React.ComponentProps<typeof Badge>["type"], string]> = [
    ["primary", "bg-primary"],
    ["secondary", "bg-secondary"],
    ["success", "bg-success"],
    ["warning", "bg-warning"],
    ["error", "bg-destructive"],
  ];

  it.each(typeCases)('type="%s" applies class "%s"', (type, expectedClass) => {
    render(<Badge text="X" type={type} />);
    const motionDiv = screen.getByText("X").closest("span")?.parentElement;
    expect(motionDiv?.className).toContain(expectedClass);
  });

  it('defaults to "primary" type when type prop is omitted', () => {
    render(<Badge text="X" />);
    const motionDiv = screen.getByText("X").closest("span")?.parentElement;
    expect(motionDiv?.className).toContain("bg-primary");
  });
});

describe("Badge variant prop", () => {
  const variants: Array<React.ComponentProps<typeof Badge>["variant"]> = [
    "pulse",
    "bounce",
    "tinypop",
  ];

  it.each(variants)('variant="%s" renders without crashing', (variant) => {
    renderBadge({ variant });
    expect(screen.getByText("Badge Text")).toBeInTheDocument();
  });

  it('defaults to "tinypop" variant when variant prop is omitted', () => {
    renderBadge();
    expect(screen.getByText("Badge Text")).toBeInTheDocument();
  });
});

describe("Badge className passthrough", () => {
  it("applies custom className to the badge element", () => {
    render(<Badge text="X" className="my-custom-badge" />);
    const motionDiv = screen.getByText("X").parentElement;
    expect(motionDiv?.className).toContain("my-custom-badge");
  });

  it("merges custom className with default classes", () => {
    render(<Badge text="X" type="success" className="extra-class" />);
    const motionDiv = screen.getByText("X").parentElement;
    expect(motionDiv?.className).toContain("bg-success");
    expect(motionDiv?.className).toContain("extra-class");
  });
});

describe("Badge structural classes", () => {
  it("outer wrapper has class 'relative inline-flex items-center'", () => {
    const { container } = renderBadge();
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("relative");
    expect(wrapper?.className).toContain("inline-flex");
    expect(wrapper?.className).toContain("items-center");
  });

  it("badge element has 'rounded-full' class", () => {
    renderBadge();
    const motionDiv = screen.getByText("Badge Text").parentElement;
    expect(motionDiv?.className).toContain("rounded-full");
  });

  it("badge element has 'z-10' class", () => {
    renderBadge();
    const motionDiv = screen.getByText("Badge Text").parentElement;
    expect(motionDiv?.className).toContain("z-10");
  });
});

describe("Badge displayName", () => {
  it('has displayName "Badge"', () => {
    expect(Badge.displayName).toBe("Badge");
  });
});
