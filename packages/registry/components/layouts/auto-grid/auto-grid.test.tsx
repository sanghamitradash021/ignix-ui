import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import AutoGrid from "./index";

const getGrid = (container: HTMLElement) =>
    container.firstChild as HTMLElement;

const renderGrid = (props = {}, children = <div>Item</div>) =>
    render(<AutoGrid {...props}>{children}</AutoGrid>);

describe("AutoGrid rendering", () => {
    it("renders a div wrapper", () => {
        const { container } = renderGrid();
        expect(getGrid(container).tagName).toBe("DIV");
    });

    it("always applies the auto-grid and mx-auto classes", () => {
        const { container } = renderGrid();
        const grid = getGrid(container);
        expect(grid).toHaveClass("auto-grid");
        expect(grid).toHaveClass("mx-auto");
    });

    it("renders children inside the grid", () => {
        const { getByText } = render(
            <AutoGrid>
                <div>Alpha</div>
                <div>Beta</div>
            </AutoGrid>
        );
        expect(getByText("Alpha")).toBeInTheDocument();
        expect(getByText("Beta")).toBeInTheDocument();
    });

    it("renders with no children without throwing", () => {
        expect(() => render(<AutoGrid>{null}</AutoGrid>)).not.toThrow();
    });
});

describe("AutoGrid display", () => {
    it("sets display to grid", () => {
        const { container } = renderGrid();
        expect(getGrid(container)).toHaveStyle({ display: "grid" });
    });
});

describe("AutoGrid gridTemplateColumns", () => {
    it("uses the default minItemWidth of 200px", () => {
        const { container } = renderGrid();
        expect(getGrid(container)).toHaveStyle({
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        });
    });

    it("reflects a custom minItemWidth", () => {
        const { container } = renderGrid({ minItemWidth: "320px" });
        expect(getGrid(container)).toHaveStyle({
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        });
    });

    it("accepts rem-based minItemWidth", () => {
        const { container } = renderGrid({ minItemWidth: "15rem" });
        expect(getGrid(container)).toHaveStyle({
            gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))",
        });
    });
});

describe("AutoGrid named gap tokens", () => {
    const cases: Array<[string, string]> = [
        ["none", "0"],
        ["small", "0.5rem"],
        ["normal", "1rem"],
        ["comfortable", "1.5rem"],
        ["large", "2rem"],
    ];

    it.each(cases)('gap="%s" resolves to "%s"', (token, expected) => {
        const { container } = renderGrid({ gap: token });
        expect(getGrid(container)).toHaveStyle({ gap: expected });
    });

    it("uses normal (1rem) as the default gap", () => {
        const { container } = renderGrid();
        expect(getGrid(container)).toHaveStyle({ gap: "1rem" });
    });
});

describe("AutoGrid arbitrary gap values", () => {
    it("passes through a pixel value directly", () => {
        const { container } = renderGrid({ gap: "24px" });
        expect(getGrid(container)).toHaveStyle({ gap: "24px" });
    });

    it("passes through a rem value directly", () => {
        const { container } = renderGrid({ gap: "2.5rem" });
        expect(getGrid(container)).toHaveStyle({ gap: "2.5rem" });
    });

    it("passes through a percentage value directly", () => {
        const { container } = renderGrid({ gap: "2%" });
        expect(getGrid(container)).toHaveStyle({ gap: "2%" });
    });
});

describe("AutoGrid balanced prop", () => {
    it("sets alignItems to start by default (balanced=false)", () => {
        const { container } = renderGrid();
        expect(getGrid(container)).toHaveStyle({ alignItems: "start" });
    });

    it("sets alignItems to stretch when balanced=true", () => {
        const { container } = renderGrid({ balanced: true });
        expect(getGrid(container)).toHaveStyle({ alignItems: "stretch" });
    });

    it("sets alignItems to start when balanced=false explicitly", () => {
        const { container } = renderGrid({ balanced: false });
        expect(getGrid(container)).toHaveStyle({ alignItems: "start" });
    });
});

describe("AutoGrid maxColumns", () => {
    it("sets maxWidth to 100% when maxColumns is not provided", () => {
        const { container } = renderGrid();
        expect(getGrid(container)).toHaveStyle({ maxWidth: "100%" });
    });

    it("computes maxWidth from maxColumns, minItemWidth, and gap (named token)", () => {
        const { container } = renderGrid({
            maxColumns: 3,
            minItemWidth: "200px",
            gap: "normal",
        });
        expect(getGrid(container)).toHaveStyle({
            maxWidth: "calc(3 * 200px + (3 - 1) * 1rem)",
        });
    });

    it("computes maxWidth with a custom minItemWidth", () => {
        const { container } = renderGrid({
            maxColumns: 4,
            minItemWidth: "250px",
            gap: "large",
        });
        expect(getGrid(container)).toHaveStyle({
            maxWidth: "calc(4 * 250px + (4 - 1) * 2rem)",
        });
    });

    it("computes maxWidth using an arbitrary gap value", () => {
        const { container } = renderGrid({
            maxColumns: 2,
            minItemWidth: "300px",
            gap: "20px",
        });
        expect(getGrid(container)).toHaveStyle({
            maxWidth: "calc(2 * 300px + (2 - 1) * 20px)",
        });
    });

    it("computes maxWidth correctly for maxColumns=1", () => {
        const { container } = renderGrid({
            maxColumns: 1,
            minItemWidth: "200px",
            gap: "none",
        });
        expect(getGrid(container)).toHaveStyle({
            maxWidth: "calc(1 * 200px + (1 - 1) * 0)",
        });
    });
});

describe("AutoGrid className", () => {
    it("appends a custom className", () => {
        const { container } = renderGrid({ className: "my-grid" });
        expect(getGrid(container)).toHaveClass("my-grid");
    });

    it("preserves auto-grid and mx-auto alongside a custom className", () => {
        const { container } = renderGrid({ className: "custom-class" });
        const grid = getGrid(container);
        expect(grid).toHaveClass("auto-grid");
        expect(grid).toHaveClass("mx-auto");
        expect(grid).toHaveClass("custom-class");
    });

    it("applies an empty string className without error (default)", () => {
        const { container } = renderGrid({ className: "" });
        expect(getGrid(container)).toHaveClass("auto-grid");
    });
});

describe("AutoGrid prop combinations", () => {
    it("handles all props together without throwing", () => {
        expect(() =>
            render(
                <AutoGrid
                    minItemWidth="250px"
                    maxColumns={4}
                    gap="comfortable"
                    balanced
                    className="combo-grid"
                >
                    <div>A</div>
                    <div>B</div>
                    <div>C</div>
                </AutoGrid>
            )
        ).not.toThrow();
    });

    it("correctly applies all styles when all props are provided", () => {
        const { container } = render(
            <AutoGrid
                minItemWidth="250px"
                maxColumns={4}
                gap="comfortable"
                balanced
                className="combo-grid"
            >
                <div>A</div>
            </AutoGrid>
        );
        const grid = getGrid(container);

        expect(grid).toHaveStyle({
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            alignItems: "stretch",
            maxWidth: "calc(4 * 250px + (4 - 1) * 1.5rem)",
        });
    });
});

describe("AutoGrid child rendering", () => {
    it("renders all children", () => {
        const { getAllByRole } = render(
            <AutoGrid>
                <div role="listitem">1</div>
                <div role="listitem">2</div>
                <div role="listitem">3</div>
                <div role="listitem">4</div>
            </AutoGrid>
        );
        expect(getAllByRole("listitem")).toHaveLength(4);
    });

    it("renders a single child without error", () => {
        const { getByText } = render(
            <AutoGrid>
                <span>Only child</span>
            </AutoGrid>
        );
        expect(getByText("Only child")).toBeInTheDocument();
    });

    it("renders deeply nested children", () => {
        const { getByText } = render(
            <AutoGrid>
                <div>
                    <section>
                        <p>Deep</p>
                    </section>
                </div>
            </AutoGrid>
        );
        expect(getByText("Deep")).toBeInTheDocument();
    });
});