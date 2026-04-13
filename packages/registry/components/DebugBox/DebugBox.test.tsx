import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { DebugBox } from "./index";

describe("DebugBox", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        vi.stubGlobal("innerWidth", 1024);
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 500 });
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 300 });
    });

    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv;
        vi.unstubAllGlobals();
    });

    describe("Environment Handling", () => {
        it("renders only children in production mode", () => {
            vi.stubEnv("NODE_ENV", "production");
            render(
                <DebugBox>
                    <div data-testid="child">Child Content</div>
                </DebugBox>
            );

            expect(screen.getByTestId("child")).toBeInTheDocument();
            expect(screen.queryByText(/Grid/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Breakpoint/i)).not.toBeInTheDocument();
        });

        it("renders overlays in non-production mode", () => {
            vi.stubEnv("NODE_ENV", "development");
            render(
                <DebugBox>
                    <div data-testid="child">Child Content</div>
                </DebugBox>
            );

            expect(screen.getByTestId("child")).toBeInTheDocument();
            expect(screen.getByText(/Grid/i)).toBeInTheDocument();
            expect(screen.getByText(/Spacing/i)).toBeInTheDocument();
            expect(screen.getByText(/Breakpoints/i)).toBeInTheDocument();
            expect(screen.getByText(/Dimensions/i)).toBeInTheDocument();
        });
    });

    describe("Overlay Toggling", () => {
        beforeEach(() => {
            vi.stubEnv("NODE_ENV", "development");
        });

        it("toggles grid overlay when checkbox is clicked", () => {
            render(
                <DebugBox defaultShowGrid={true}>
                    <div>Content</div>
                </DebugBox>
            );

            const gridCheckbox = screen.getByLabelText(/Grid/i);
            expect(gridCheckbox).toBeChecked();

            fireEvent.click(gridCheckbox);
            expect(gridCheckbox).not.toBeChecked();
        });

        it("toggles spacing overlay when checkbox is clicked", () => {
            render(
                <DebugBox defaultShowSpacing={true}>
                    <div>Content</div>
                </DebugBox>
            );

            const spacingCheckbox = screen.getByLabelText(/Spacing/i);
            expect(spacingCheckbox).toBeChecked();

            fireEvent.click(spacingCheckbox);
            expect(spacingCheckbox).not.toBeChecked();
        });

        it("toggles breakpoints overlay when checkbox is clicked", () => {
            render(
                <DebugBox defaultShowBreakpoints={true}>
                    <div>Content</div>
                </DebugBox>
            );

            const breakpointsCheckbox = screen.getByLabelText(/Breakpoints/i);
            expect(breakpointsCheckbox).toBeChecked();

            expect(screen.getByText(/LG/i)).toBeInTheDocument();

            fireEvent.click(breakpointsCheckbox);
            expect(breakpointsCheckbox).not.toBeChecked();
            expect(screen.queryByText(/LG/i)).not.toBeInTheDocument();
        });

        it("toggles dimensions overlay when checkbox is clicked", () => {
            render(
                <DebugBox defaultShowDimensions={true}>
                    <div>Content</div>
                </DebugBox>
            );

            const dimensionsCheckbox = screen.getByLabelText(/Dimensions/i);
            expect(dimensionsCheckbox).toBeChecked();

            expect(screen.getByText(/500px × 300px/i)).toBeInTheDocument();

            fireEvent.click(dimensionsCheckbox);
            expect(dimensionsCheckbox).not.toBeChecked();
            expect(screen.queryByText(/500px × 300px/i)).not.toBeInTheDocument();
        });
    });

    describe("Breakpoint Detection", () => {
        beforeEach(() => {
            vi.stubEnv("NODE_ENV", "development");
        });

        const testBreakpoints = [
            { width: 500, expected: "XS" },
            { width: 700, expected: "SM" },
            { width: 800, expected: "MD" },
            { width: 1100, expected: "LG" },
            { width: 1300, expected: "XL" },
        ];

        testBreakpoints.forEach(({ width, expected }) => {
            it(`detects ${expected} breakpoint at ${width}px`, () => {
                vi.stubGlobal("innerWidth", width);
                render(
                    <DebugBox defaultShowBreakpoints={true}>
                        <div>Content</div>
                    </DebugBox>
                );

                expect(screen.getByText(expected)).toBeInTheDocument();
            });
        });

        it("updates breakpoint on window resize", () => {
            vi.stubGlobal("innerWidth", 1100); // LG
            render(
                <DebugBox defaultShowBreakpoints={true}>
                    <div>Content</div>
                </DebugBox>
            );

            expect(screen.getByText("LG")).toBeInTheDocument();

            act(() => {
                vi.stubGlobal("innerWidth", 500); // XS
                window.dispatchEvent(new Event("resize"));
            });

            expect(screen.getByText("XS")).toBeInTheDocument();
        });
    });

    describe("Dimension Tracking", () => {
        beforeEach(() => {
            vi.stubEnv("NODE_ENV", "development");
        });

        it("updates dimensions on window resize", () => {
            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 500 });
            Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 300 });

            render(
                <DebugBox defaultShowDimensions={true}>
                    <div>Content</div>
                </DebugBox>
            );

            expect(screen.getByText(/500px × 300px/i)).toBeInTheDocument();

            act(() => {
                Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 600 });
                Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 400 });
                window.dispatchEvent(new Event("resize"));
            });

            expect(screen.getByText(/600px × 400px/i)).toBeInTheDocument();
        });
    });
});
