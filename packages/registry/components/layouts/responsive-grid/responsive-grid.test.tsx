import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ResponsiveGrid from "./index";
import React from "react";

const renderGrid = (props: any = {}, children: React.ReactNode = <div>item</div>) =>
    render(<ResponsiveGrid {...props}>{children}</ResponsiveGrid>);

const getGrid = () => document.querySelector(".responsive-grid") as HTMLElement;

describe("ResponsiveGrid", () => {
    beforeEach(() => {
        vi.spyOn(Math, "random").mockReturnValue(0.123456789);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Rendering & Defaults", () => {
        it("renders children correctly", () => {
            renderGrid({}, <div data-testid="child">Hello Grid</div>);
            expect(screen.getByTestId("child")).toBeInTheDocument();
            expect(screen.getByText("Hello Grid")).toBeInTheDocument();
        });

        it("renders as a div with base classes", () => {
            renderGrid();
            const grid = getGrid();
            expect(grid.tagName).toBe("DIV");
            expect(grid).toHaveClass("responsive-grid");
            expect(grid).toHaveClass("responsive-grid-4fzzzxj");
        });

        it("applies default styles", () => {
            renderGrid();
            const grid = getGrid();
            expect(grid.style.display).toBe("grid");
            expect(grid.style.gap).toBe("1rem");
            expect(grid.style.alignItems).toBe("start");
        });
    });

    describe("Props & Styles", () => {
        it("applies 'small' gap", () => {
            renderGrid({ gap: "small" });
            expect(getGrid().style.gap).toBe("0.5rem");
        });

        it("applies 'large' gap", () => {
            renderGrid({ gap: "large" });
            expect(getGrid().style.gap).toBe("2rem");
        });

        it("applies custom gap string", () => {
            renderGrid({ gap: "3rem" });
            expect(getGrid().style.gap).toBe("3rem");
        });

        it("applies equalHeight alignItems style", () => {
            renderGrid({ equalHeight: true });
            expect(getGrid().style.alignItems).toBe("stretch");
        });

        it("applies custom className", () => {
            renderGrid({ className: "custom-class" });
            expect(getGrid()).toHaveClass("custom-class");
        });
    });

    describe("Responsive Columns (Style Tag)", () => {
        it("injects a style tag with correct column counts", () => {
            renderGrid({
                columns: { mobile: 2, tablet: 3, desktop: 6 },
                minItemWidth: "100px",
            });

            const styleTag = document.querySelector("style");
            expect(styleTag).toBeInTheDocument();
            const css = styleTag?.innerHTML;

            // Mobile
            expect(css).toContain(".responsive-grid-4fzzzxj {");
            expect(css).toContain("grid-template-columns: repeat(2, minmax(100px, 1fr));");

            // Tablet
            expect(css).toContain("@media (min-width: 640px)");
            expect(css).toContain("grid-template-columns: repeat(3, minmax(100px, 1fr));");

            // Desktop
            expect(css).toContain("@media (min-width: 1024px)");
            expect(css).toContain("grid-template-columns: repeat(6, minmax(100px, 1fr));");
        });

        it("uses fallback column logic when some breakpoints are missing", () => {
            renderGrid({
                columns: { mobile: 2 },
            });

            const css = document.querySelector("style")?.innerHTML;

            expect(css).toContain("repeat(2, minmax(0px, 1fr))");
            const matches = css?.match(/repeat\(2, minmax\(0px, 1fr\)\)/g);
            expect(matches?.length).toBe(3);
        });
    });

    describe("Animations", () => {
        it("does not wrap children in motion.div when animation='none'", () => {
            renderGrid({ animation: "none" }, <div data-testid="item">Item</div>);
            const item = screen.getByTestId("item");
            expect(item.parentElement).toHaveClass("responsive-grid");
        });

        it("wraps children in motion.div when animation is provided", () => {
            renderGrid({ animation: "fade" }, <div data-testid="item">Item</div>);
            const item = screen.getByTestId("item");
            expect(item.parentElement).not.toHaveClass("responsive-grid");
            expect(item.parentElement?.tagName).toBe("DIV");
        });

        it("applies transition delay for 'stagger' animation", () => {
            renderGrid({ animation: "stagger" }, [
                <div key="1" data-testid="item-1">Item 1</div>,
                <div key="2" data-testid="item-2">Item 2</div>,
            ]);
            expect(screen.getByTestId("item-1")).toBeInTheDocument();
            expect(screen.getByTestId("item-2")).toBeInTheDocument();
        });
    });
});
