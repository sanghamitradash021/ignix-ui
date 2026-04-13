import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Breadcrumbs } from "./index";
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
    layout?: unknown;
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
              layout: _l,
              ...rest
            },
            ref
          ) =>
            React.createElement(tag, { ...rest, ref }, children)
        ),
    }
  );

  const AnimatePresence = ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);

  return { motion, AnimatePresence, HTMLMotionProps: {} };
});

vi.mock("lucide-react", () => {
  const icon = (name: string) => (props: Record<string, unknown>) =>
    React.createElement("svg", {
      ...props,
      "data-testid": `icon-${name}`,
    });

  return {
    ChevronRight: icon("chevron-right"),
    Check: icon("check"),
    Circle: icon("circle"),
    Home: icon("home"),
    ArrowRight: icon("arrow-right"),
  };
});

const getNav = () => screen.getByRole("navigation");

const sampleItems = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Current Page" },
];

const sampleSteps = ["Cart", "Shipping", "Payment", "Confirm"];

describe("Breadcrumbs rendering", () => {
  it("renders a <nav> element with aria-label", () => {
    render(<Breadcrumbs />);
    const nav = getNav();
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute("aria-label", "Breadcrumb navigation");
  });

  it("renders without items or steps without crashing", () => {
    render(<Breadcrumbs />);
    expect(getNav()).toBeInTheDocument();
  });

  it("passes custom className to the nav", () => {
    render(<Breadcrumbs className="my-custom" />);
    expect(getNav()).toHaveClass("my-custom");
  });
});

describe('Breadcrumbs variant="text"', () => {
  it("renders all item labels", () => {
    render(<Breadcrumbs variant="text" items={sampleItems} />);
    sampleItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it("renders items with href as <a> links (except last item)", () => {
    render(<Breadcrumbs variant="text" items={sampleItems} />);
    expect(screen.getByRole("link", { name: /Home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /Products/i })).toHaveAttribute("href", "/products");
  });

  it("does not render the last item as a link even if it has href", () => {
    const items = [
      { label: "A", href: "/a" },
      { label: "B", href: "/b" },
    ];
    render(<Breadcrumbs variant="text" items={items} />);
    const links = screen.getAllByRole("link");
    const linkTexts = links.map((l) => l.textContent);
    expect(linkTexts).not.toContain("B");
  });

  it("renders separator icons between items", () => {
    const { container } = render(
      <Breadcrumbs variant="text" items={sampleItems} />
    );
    const separatorIcons = container.querySelectorAll('[data-testid="icon-chevron-right"]');
    expect(separatorIcons.length).toBe(sampleItems.length - 1);
  });

  it("adds Home icon to the first item automatically", () => {
    const { container } = render(
      <Breadcrumbs variant="text" items={sampleItems} />
    );
    const homeIcons = container.querySelectorAll('[data-testid="icon-home"]');
    expect(homeIcons.length).toBeGreaterThanOrEqual(1);
  });

  it("does not render items when variant is not text", () => {
    render(<Breadcrumbs variant="step" items={sampleItems} />);
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
  });
});

describe('Breadcrumbs variant="step"', () => {
  it("renders all step labels", () => {
    render(<Breadcrumbs variant="step" steps={sampleSteps} currentStep={1} />);
    sampleSteps.forEach((step) => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });

  it("renders step numbers for future and active steps", () => {
    render(<Breadcrumbs variant="step" steps={sampleSteps} currentStep={1} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders check icon for completed steps", () => {
    const { container } = render(
      <Breadcrumbs variant="step" steps={sampleSteps} currentStep={2} />
    );
    const checkIcons = container.querySelectorAll('[data-testid="icon-check"]');
    expect(checkIcons.length).toBe(2);
  });

  it("renders separators between steps", () => {
    const { container } = render(
      <Breadcrumbs variant="step" steps={sampleSteps} currentStep={0} />
    );
    const separators = container.querySelectorAll('[data-testid="icon-chevron-right"]');
    expect(separators.length).toBe(sampleSteps.length - 1);
  });

  it("does not render steps when variant is text", () => {
    render(<Breadcrumbs variant="text" steps={sampleSteps} />);
    expect(screen.queryByText("Cart")).not.toBeInTheDocument();
  });
});

describe('Breadcrumbs variant="progress"', () => {
  it("renders all step labels", () => {
    render(
      <Breadcrumbs variant="progress" steps={sampleSteps} currentStep={0} />
    );
    sampleSteps.forEach((step) => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });

  it("renders a progress percentage", () => {
    render(
      <Breadcrumbs variant="progress" steps={sampleSteps} currentStep={1} />
    );
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("shows 100% when on the last step", () => {
    render(
      <Breadcrumbs variant="progress" steps={sampleSteps} currentStep={3} />
    );
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("shows 25% for first step with 4 steps", () => {
    render(
      <Breadcrumbs variant="progress" steps={sampleSteps} currentStep={0} />
    );
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("renders ArrowRight separators between steps", () => {
    const { container } = render(
      <Breadcrumbs variant="progress" steps={sampleSteps} currentStep={0} />
    );
    const arrows = container.querySelectorAll('[data-testid="icon-arrow-right"]');
    expect(arrows.length).toBe(sampleSteps.length - 1);
  });
});

describe('Breadcrumbs variant="custom"', () => {
  it("renders all item labels", () => {
    render(<Breadcrumbs variant="custom" items={sampleItems} currentStep={0} />);
    sampleItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it("renders check icons for completed items (index <= currentStep)", () => {
    const { container } = render(
      <Breadcrumbs variant="custom" items={sampleItems} currentStep={1} />
    );
    const checkIcons = container.querySelectorAll('[data-testid="icon-check"]');
    expect(checkIcons.length).toBe(2);
  });

  it("renders circle icons for future items (index > currentStep)", () => {
    const { container } = render(
      <Breadcrumbs variant="custom" items={sampleItems} currentStep={0} />
    );
    const circleIcons = container.querySelectorAll('[data-testid="icon-circle"]');
    expect(circleIcons.length).toBe(2);
  });

  it("renders items as links with href", () => {
    render(
      <Breadcrumbs variant="custom" items={sampleItems} currentStep={0} />
    );
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(sampleItems.length);
  });
});

describe("Breadcrumbs variant classes", () => {
  const variantCases: Array<[string, string]> = [
    ["text", "bg-background/50"],
    ["step", "flex-col"],
    ["progress", "shadow-lg"],
    ["custom", "shadow-xl"],
  ];

  it.each(variantCases)(
    'variant="%s" applies class containing "%s"',
    (variant, expectedClass) => {
      render(<Breadcrumbs variant={variant as never} />);
      expect(getNav().className).toContain(expectedClass);
    }
  );
});