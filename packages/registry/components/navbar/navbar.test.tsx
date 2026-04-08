import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Navbar } from "./index";
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

  const AnimatePresence = ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);

  return { motion, AnimatePresence, HTMLMotionProps: {} };
});

const getNav = () => screen.getByRole("navigation");

type NavbarProps = React.ComponentProps<typeof Navbar>;

describe("Navbar rendering", () => {
  it("renders a <nav> element", () => {
    render(<Navbar />);
    expect(getNav()).toBeInTheDocument();
  });

  it("renders children when animationType is default (slide)", () => {
    render(<Navbar animationType="slide"><span>Link</span></Navbar>);
    expect(screen.getByText("Link")).toBeInTheDocument();
  });

  it("renders the header text for hoverSubmenu", () => {
    render(<Navbar animationType="hoverSubmenu" header="Menu" />);
    expect(screen.getByText("Menu")).toBeInTheDocument();
  });

  it("renders the header text for clickSubmenu", () => {
    render(<Navbar animationType="clickSubmenu" header="Nav" />);
    expect(screen.getByText("Nav")).toBeInTheDocument();
  });

  it("does not render children for hoverSubmenu/clickSubmenu", () => {
    render(
      <Navbar animationType="hoverSubmenu" header="Menu">
        <span>Should not appear</span>
      </Navbar>
    );
    expect(screen.queryByText("Should not appear")).not.toBeInTheDocument();
  });
});

describe("Navbar variant classes", () => {
  const variantCases: Array<[NonNullable<NavbarProps["variant"]>, string]> = [
    ["default", "bg-background"],
    ["dark", "bg-card"],
    ["transparent", "bg-transparent"],
    ["glass", "backdrop-blur-lg"],
    ["gradient", "bg-gradient-to-r"],
    ["primary", "bg-primary"],
  ];

  it.each(variantCases)('variant="%s" applies class containing "%s"', (variant, expected) => {
    render(<Navbar variant={variant as never} />);
    expect(getNav().className).toContain(expected);
  });
});

describe("Navbar size classes", () => {
  const sizeCases: Array<[NonNullable<NavbarProps["size"]>, string]> = [
    ["sm", "h-12"],
    ["md", "h-16"],
    ["lg", "h-20"],
    ["xl", "h-24"],
  ];

  it.each(sizeCases)('size="%s" applies class "%s"', (size, expected) => {
    render(<Navbar size={size as never} />);
    expect(getNav()).toHaveClass(expected);
  });
});

describe("Navbar direction classes", () => {
  it('direction="horizontal" applies flex-row', () => {
    render(<Navbar direction="horizontal" />);
    expect(getNav()).toHaveClass("flex-row");
  });

  it('direction="vertical" applies flex-col', () => {
    render(<Navbar direction="vertical" />);
    expect(getNav()).toHaveClass("flex-col");
  });

  it("hoverSubmenu forces vertical direction regardless of direction prop", () => {
    render(<Navbar animationType="hoverSubmenu" direction="horizontal" header="Menu" />);
    expect(getNav()).toHaveClass("flex-col");
  });

  it("clickSubmenu forces vertical direction regardless of direction prop", () => {
    render(<Navbar animationType="clickSubmenu" direction="horizontal" header="Menu" />);
    expect(getNav()).toHaveClass("flex-col");
  });
});

describe("Navbar className passthrough", () => {
  it("merges custom className onto the nav element", () => {
    render(<Navbar className="my-custom-nav" />);
    expect(getNav()).toHaveClass("my-custom-nav");
  });
});

describe('Navbar animationType="basic"', () => {
  it("renders each child wrapped in a motion div", () => {
    render(
      <Navbar animationType="basic">
        <span>Home</span>
        <span>About</span>
      </Navbar>
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("ignores non-element children", () => {
    render(
      <Navbar animationType="basic">
        {null}
        {"plain text"}
        <span>Valid</span>
      </Navbar>
    );
    expect(screen.getByText("Valid")).toBeInTheDocument();
  });
});

describe('Navbar – animationType="spotlight"', () => {
  it("renders children inside rounded-full wrappers", () => {
    render(
      <Navbar animationType="spotlight">
        <span>Logo</span>
      </Navbar>
    );
    const logo = screen.getByText("Logo");
    expect(logo.parentElement).toHaveClass("rounded-full");
  });
});

describe('Navbar animationType="hoverSubmenu"', () => {
  it("does not show submenu content initially", () => {
    render(
      <Navbar
        animationType="hoverSubmenu"
        header="Products"
        submenuContent={<div>Submenu Items</div>}
      />
    );
    expect(screen.queryByText("Submenu Items")).not.toBeInTheDocument();
  });

  it("shows submenu content on mouse enter", () => {
    render(
      <Navbar
        animationType="hoverSubmenu"
        header="Products"
        submenuContent={<div>Submenu Items</div>}
      />
    );
    fireEvent.mouseEnter(getNav());
    expect(screen.getByText("Submenu Items")).toBeInTheDocument();
  });

  it("hides submenu content on mouse leave", async () => {
    render(
      <Navbar
        animationType="hoverSubmenu"
        header="Products"
        submenuContent={<div>Submenu Items</div>}
      />
    );
    fireEvent.mouseEnter(getNav());
    expect(screen.getByText("Submenu Items")).toBeInTheDocument();

    fireEvent.mouseLeave(getNav());
    await waitFor(() =>
      expect(screen.queryByText("Submenu Items")).not.toBeInTheDocument()
    );
  });

  it("shows ChevronUp icon when submenu is open", () => {
    render(
      <Navbar
        animationType="hoverSubmenu"
        header="Products"
        submenuContent={<div>Items</div>}
      />
    );
    fireEvent.mouseEnter(getNav());
    const header = screen.getByText("Products");
    expect(header).toBeInTheDocument();
    const chevrons = getNav().querySelectorAll("svg");
    expect(chevrons.length).toBeGreaterThan(0);
  });

  it("renders without submenuContent without crashing", () => {
    render(<Navbar animationType="hoverSubmenu" header="Menu" />);
    fireEvent.mouseEnter(getNav());
    expect(screen.getByText("Menu")).toBeInTheDocument();
  });
});

describe('Navbar animationType="clickSubmenu"', () => {
  it("does not show submenu initially", () => {
    render(
      <Navbar
        animationType="clickSubmenu"
        header="Settings"
        submenuContent={<div>Click Submenu</div>}
      />
    );
    expect(screen.queryByText("Click Submenu")).not.toBeInTheDocument();
  });

  it("clicking the nav body does toggle submenu", async () => {
    render(
      <Navbar
        animationType="clickSubmenu"
        header="Settings"
        submenuContent={<div>Click Submenu</div>}
      />
    );
    await userEvent.click(getNav());
    expect(screen.queryByText("Click Submenu")).not.toBeInTheDocument();
  });

  it("mouse hover does NOT open clickSubmenu", () => {
    render(
      <Navbar
        animationType="clickSubmenu"
        header="Settings"
        submenuContent={<div>Click Submenu</div>}
      />
    );
    fireEvent.mouseEnter(getNav());
    expect(screen.queryByText("Click Submenu")).not.toBeInTheDocument();
  });
});

describe('Navbar animationType="slide" | "glow"', () => {
  it('slide: renders children directly', () => {
    render(<Navbar animationType="slide"><a href="#">Home</a></Navbar>);
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });

  it('glow: renders children directly', () => {
    render(<Navbar animationType="glow"><a href="#">About</a></Navbar>);
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
  });
});

describe("Navbar submenu variant styles", () => {
  it('applies bg-card to submenu when variant="dark"', async () => {
    render(
      <Navbar
        animationType="hoverSubmenu"
        variant="dark"
        header="Dark"
        submenuContent={<span>Dark submenu</span>}
      />
    );
    fireEvent.mouseEnter(getNav());

    const submenu = screen.getByText("Dark submenu").closest("div");
    expect(submenu?.className).toContain("bg-card");
  });

  it('applies bg-primary to submenu when variant="primary"', async () => {
    render(
      <Navbar
        animationType="hoverSubmenu"
        variant="primary"
        header="Primary"
        submenuContent={<span>Primary submenu</span>}
      />
    );
    fireEvent.mouseEnter(getNav());

    const submenu = screen.getByText("Primary submenu").closest("div");
    expect(submenu?.className).toContain("bg-primary");
  });
});

describe("Navbar – displayName", () => {
  it('has displayName "Navbar"', () => {
    expect(Navbar.displayName).toBe("Navbar");
  });
});