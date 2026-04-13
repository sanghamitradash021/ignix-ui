import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Stack, type StackProps } from "./index";

describe("Stack Component", () => {
  const renderStack = (props: Partial<StackProps> = {}, children: React.ReactNode = <div>Item</div>) =>
    render(<Stack {...props}>{children}</Stack>);

  const getStack = () => screen.getByText(/Item/i).parentElement as HTMLElement;

  it("renders children correctly", () => {
    renderStack({}, (
      <>
        <span>Item 1</span>
        <span>Item 2</span>
      </>
    ));
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  describe("direction prop", () => {
    it("defaults to 'vertical' (flex-col)", () => {
      renderStack();
      expect(getStack()).toHaveClass("flex-col");
    });

    it("applies 'flex-row' for horizontal direction", () => {
      renderStack({ direction: "horizontal" });
      expect(getStack()).toHaveClass("flex-row");
    });
  });

  describe("align prop", () => {
    const alignCases: Array<[StackProps["align"], string]> = [
      ["start", "items-start"],
      ["center", "items-center"],
      ["end", "items-end"],
      ["stretch", "items-stretch"],
    ];

    it.each(alignCases)("align='%s' class '%s'", (align, expected) => {
      renderStack({ align });
      expect(getStack()).toHaveClass(expected);
    });

    it("defaults to 'stretch' (items-stretch)", () => {
      renderStack();
      expect(getStack()).toHaveClass("items-stretch");
    });
  });

  describe("justify prop", () => {
    const justifyCases: Array<[StackProps["justify"], string]> = [
      ["start", "justify-start"],
      ["center", "justify-center"],
      ["end", "justify-end"],
      ["between", "justify-between"],
      ["around", "justify-around"],
    ];

    it.each(justifyCases)("justify='%s' class '%s'", (justify, expected) => {
      renderStack({ justify });
      expect(getStack()).toHaveClass(expected);
    });

    it("defaults to 'start' (justify-start)", () => {
      renderStack();
      expect(getStack()).toHaveClass("justify-start");
    });
  });

  describe("spacing prop", () => {
    const spacingCases: Array<[StackProps["spacing"], string]> = [
      ["none", "gap-0"],
      ["xs", "gap-1"],
      ["sm", "gap-2"],
      ["normal", "gap-4"],
      ["lg", "gap-8"],
      ["xl", "gap-12"],
    ];

    it.each(spacingCases)("spacing='%s' class '%s'", (spacing, expected) => {
      renderStack({ spacing });
      expect(getStack()).toHaveClass(expected);
    });

    it("defaults to 'normal' (gap-4)", () => {
      renderStack();
      expect(getStack()).toHaveClass("gap-4");
    });

    it("supports custom gap values", () => {
      renderStack({ spacing: "gap-[20px]" });
      expect(getStack()).toHaveClass("gap-[20px]");
    });
  });

  describe("wrap prop", () => {
    it("applies 'flex-wrap' when true", () => {
      renderStack({ wrap: true });
      expect(getStack()).toHaveClass("flex-wrap");
    });

    it("does not apply 'flex-wrap' by default", () => {
      renderStack();
      expect(getStack()).not.toHaveClass("flex-wrap");
    });
  });

  describe("responsive prop", () => {
    it("applies responsive direction classes", () => {
      renderStack({
        responsive: {
          mobile: "vertical",
          tablet: "horizontal",
          desktop: "vertical",
        },
      });
      const stack = getStack();
      expect(stack).toHaveClass("flex-col");
      expect(stack).toHaveClass("sm:flex-row");
      expect(stack).toHaveClass("md:flex-col");
    });

    it("handles partial responsive configuration", () => {
      renderStack({
        responsive: {
          tablet: "horizontal",
        },
      });
      const stack = getStack();
      expect(stack).toHaveClass("sm:flex-row");
    });
  });

  describe("className prop", () => {
    it("merges custom className", () => {
      renderStack({ className: "custom-class" });
      expect(getStack()).toHaveClass("custom-class");
      expect(getStack()).toHaveClass("flex");
    });
  });
});
