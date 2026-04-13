import type { ComponentProps } from "react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { Split, type Ratio, type Gap } from "./index";

describe("Split Component", () => {
    const LeftContent = () => <div data-testid="left-content">Left Panel</div>;
    const RightContent = () => <div data-testid="right-content">Right Panel</div>;

    const renderSplit = (props: Partial<ComponentProps<typeof Split>> = {}) =>
        render(
            <Split {...props}>
                <LeftContent />
                <RightContent />
            </Split>
        );

    it("renders both children correctly", () => {
        renderSplit();
        expect(screen.getByTestId("left-content")).toBeInTheDocument();
        expect(screen.getByTestId("right-content")).toBeInTheDocument();
        expect(screen.getByText("Left Panel")).toBeInTheDocument();
        expect(screen.getByText("Right Panel")).toBeInTheDocument();
    });

    describe("ratio prop", () => {
        const ratioCases: Array<[Ratio, string, string]> = [
            ["30:70", "30%", "70%"],
            ["40:60", "40%", "60%"],
            ["50:50", "50%", "50%"],
            ["60:40", "60%", "40%"],
            ["70:30", "70%", "30%"],
        ];

        it.each(ratioCases)(
            "applies flex-basis correctly for ratio '%s'",
            (ratio, leftBasis, rightBasis) => {
                renderSplit({ ratio });
                const leftPanel = screen.getByTestId("left-content").parentElement;
                const rightPanel = screen.getByTestId("right-content").parentElement;

                expect(leftPanel).toHaveStyle({ flexBasis: leftBasis });
                expect(rightPanel).toHaveStyle({ flexBasis: rightBasis });
            }
        );

        it("updates sizes when ratio prop changes", () => {
            const { rerender } = renderSplit({ ratio: "50:50" });
            let leftPanel = screen.getByTestId("left-content").parentElement;
            expect(leftPanel).toHaveStyle({ flexBasis: "50%" });

            rerender(
                <Split ratio="30:70">
                    <LeftContent />
                    <RightContent />
                </Split>
            );
            leftPanel = screen.getByTestId("left-content").parentElement;
            expect(leftPanel).toHaveStyle({ flexBasis: "30%" });
        });
    });

    describe("gap prop", () => {
        const gapCases: Array<[Gap, string]> = [
            ["none", "gap-0"],
            ["small", "gap-2"],
            ["normal", "gap-4"],
            ["large", "gap-8"],
        ];

        it.each(gapCases)("applies class '%s' for gap '%s'", (gap, expectedClass) => {
            renderSplit({ gap });
            const container = screen.getByTestId("left-content").parentElement?.parentElement;
            expect(container).toHaveClass(expectedClass);
        });
    });

    describe("mobile prop", () => {
        it("applies responsive classes for 'stack'", () => {
            renderSplit({ mobile: "stack" });
            const container = screen.getByTestId("left-content").parentElement?.parentElement;
            expect(container).toHaveClass("flex-col");
            expect(container).toHaveClass("sm:flex-row");
        });

        it("applies responsive classes for 'reverse'", () => {
            renderSplit({ mobile: "reverse" });
            const container = screen.getByTestId("left-content").parentElement?.parentElement;
            expect(container).toHaveClass("flex-col-reverse");
            expect(container).toHaveClass("sm:flex-row-reverse");
        });

        it("does not apply responsive layout classes for 'keep-split' (default)", () => {
            renderSplit({ mobile: "keep-split" });
            const container = screen.getByTestId("left-content").parentElement?.parentElement;
            expect(container).not.toHaveClass("flex-col");
            expect(container).not.toHaveClass("flex-col-reverse");
        });
    });

    describe("minWidth prop", () => {
        it("applies min-width style to the container", () => {
            renderSplit({ minWidth: "500px" });
            const container = screen.getByTestId("left-content").parentElement?.parentElement;
            expect(container).toHaveStyle({ minWidth: "500px" });
        });

        it("defaults to 300px min-width", () => {
            renderSplit();
            const container = screen.getByTestId("left-content").parentElement?.parentElement;
            expect(container).toHaveStyle({ minWidth: "300px" });
        });
    });

    describe("resizable behavior", () => {
        it("renders resize handle when resizable is true", () => {
            const { container } = renderSplit({ resizable: true });
            const handle = container.querySelector(".cursor-col-resize");
            expect(handle).toBeInTheDocument();
        });

        it("does not render resize handle by default", () => {
            const { container } = renderSplit({ resizable: false });
            const handle = container.querySelector(".cursor-col-resize");
            expect(handle).not.toBeInTheDocument();
        });

        it("updates panel sizes on drag", () => {
            const getBoundingClientRectMock = vi.fn(() => ({
                width: 1000,
                left: 0,
                top: 0,
                right: 1000,
                bottom: 100,
                x: 0,
                y: 0,
                toJSON: () => { vi.fn() },
            }));

            const { container } = renderSplit({ resizable: true });
            const splitContainer = screen.getByTestId("left-content").parentElement?.parentElement;
            if (splitContainer) {
                splitContainer.getBoundingClientRect = getBoundingClientRectMock as any;
            }

            const handle = container.querySelector(".cursor-col-resize");
            expect(handle).not.toBeNull();

            fireEvent.mouseDown(handle!);

            fireEvent.mouseMove(document, { clientX: 400 });

            const leftPanel = screen.getByTestId("left-content").parentElement;
            const rightPanel = screen.getByTestId("right-content").parentElement;

            expect(leftPanel).toHaveStyle({ flexBasis: "40%" });
            expect(rightPanel).toHaveStyle({ flexBasis: "60%" });

            fireEvent.mouseMove(document, { clientX: 800 });
            expect(leftPanel).toHaveStyle({ flexBasis: "80%" });
            expect(rightPanel).toHaveStyle({ flexBasis: "20%" });
            fireEvent.mouseUp(document);
            fireEvent.mouseMove(document, { clientX: 200 });
            expect(leftPanel).toHaveStyle({ flexBasis: "80%" });
        });

        it("respects min/max drag limits (10% to 90%)", () => {
            const getBoundingClientRectMock = vi.fn(() => ({
                width: 1000,
                left: 0,
                top: 0,
                right: 1000,
                bottom: 100,
                x: 0,
                y: 0,
                toJSON: () => { vi.fn() },
            }));

            const { container } = renderSplit({ resizable: true });
            const splitContainer = screen.getByTestId("left-content").parentElement?.parentElement;
            if (splitContainer) {
                splitContainer.getBoundingClientRect = getBoundingClientRectMock as any;
            }

            const handle = container.querySelector(".cursor-col-resize");
            fireEvent.mouseDown(handle!);

            fireEvent.mouseMove(document, { clientX: 50 });
            let leftPanel = screen.getByTestId("left-content").parentElement;
            expect(leftPanel).toHaveStyle({ flexBasis: "10%" });
            fireEvent.mouseMove(document, { clientX: 950 });
            leftPanel = screen.getByTestId("left-content").parentElement;
            expect(leftPanel).toHaveStyle({ flexBasis: "90%" });

            fireEvent.mouseUp(document);
        });
    });

    describe("className prop", () => {
        it("merges custom className with container classes", () => {
            renderSplit({ className: "custom-split-class" });
            const container = screen.getByTestId("left-content").parentElement?.parentElement;
            expect(container).toHaveClass("custom-split-class");
            expect(container).toHaveClass("flex");
        });
    });
});
