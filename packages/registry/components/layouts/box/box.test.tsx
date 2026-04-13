import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Box, type BoxProps } from "./index";

const renderBox = (props: Partial<BoxProps> = {}, children: React.ReactNode = "content") =>
    render(<Box {...props}>{children}</Box>);

const getBox = () => screen.getByText(/content/i).closest("div") as HTMLElement;

describe("Box", () => {

    describe("rendering", () => {
        it("renders children correctly", () => {
            renderBox({}, "Hello Box");
            expect(screen.getByText("Hello Box")).toBeInTheDocument();
        });

        it("renders as a div element", () => {
            renderBox();
            expect(getBox().tagName).toBe("DIV");
        });

        it("renders with multiple children", () => {
            render(
                <Box>
                    <span>Child A</span>
                    <span>Child B</span>
                </Box>
            );
            expect(screen.getByText("Child A")).toBeInTheDocument();
            expect(screen.getByText("Child B")).toBeInTheDocument();
        });

        it("always applies base utility classes", () => {
            renderBox();
            const box = getBox();
            expect(box.className).toContain("max-w-full");
            expect(box.className).toContain("overflow-auto");
            expect(box.className).toContain("scrollbar-hidden");
        });
    });

    describe("width prop", () => {
        const cases: Array<[BoxProps["width"], string]> = [
            ["auto", "w-auto"],
            ["small", "w-32"],
            ["normal", "w-64"],
            ["large", "w-96"],
            ["full", "w-full"],
        ];

        it.each(cases)("width='%s' class '%s'", (width, expected) => {
            renderBox({ width });
            expect(getBox()).toHaveClass(expected);
        });

        it("defaults to 'normal' width (w-64)", () => {
            renderBox();
            expect(getBox().className).toContain("w-64");
        });

        it("passes through an arbitrary width value as-is", () => {
            renderBox({ width: "w-[320px]" });
            expect(getBox()).toHaveClass("w-[320px]");
        });
    });

    describe("height prop", () => {
        const cases: Array<[BoxProps["height"], string]> = [
            ["auto", "h-auto"],
            ["small", "h-16"],
            ["normal", "h-32"],
            ["large", "h-64"],
            ["screen", "h-screen"],
        ];

        it.each(cases)("height='%s' class '%s'", (height, expected) => {
            renderBox({ height });
            expect(getBox()).toHaveClass(expected);
        });

        it("defaults to 'auto' height (h-auto)", () => {
            renderBox();
            expect(getBox().className).toContain("h-auto");
        });

        it("passes through an arbitrary height value as-is", () => {
            renderBox({ height: "h-[500px]" });
            expect(getBox()).toHaveClass("h-[500px]");
        });
    });

    describe("padding prop", () => {
        const cases: Array<[BoxProps["padding"], string]> = [
            ["none", "p-0"],
            ["sm", "p-2"],
            ["normal", "p-4"],
            ["lg", "p-8"],
        ];

        it.each(cases)("padding='%s' class '%s'", (padding, expected) => {
            renderBox({ padding });
            expect(getBox()).toHaveClass(expected);
        });

        it("defaults to 'normal' padding (p-4)", () => {
            renderBox();
            expect(getBox().className).toContain("p-4");
        });
    });

    describe("rounded prop", () => {
        const cases: Array<[BoxProps["rounded"], string]> = [
            ["none", "rounded-none"],
            ["sm", "rounded-sm"],
            ["md", "rounded-md"],
            ["lg", "rounded-lg"],
            ["full", "rounded-full"],
        ];

        it.each(cases)("rounded='%s' class '%s'", (rounded, expected) => {
            renderBox({ rounded });
            expect(getBox()).toHaveClass(expected);
        });

        it("defaults to 'md' rounded (rounded-md)", () => {
            renderBox();
            expect(getBox().className).toContain("rounded-md");
        });
    });

    describe("shadow prop", () => {
        const cases: Array<[BoxProps["shadow"], string]> = [
            ["none", "shadow-none"],
            ["subtle", "shadow-sm"],
            ["medium", "shadow-md"],
            ["strong", "shadow-lg"],
        ];

        it.each(cases)("shadow='%s' class '%s'", (shadow, expected) => {
            renderBox({ shadow });
            expect(getBox()).toHaveClass(expected);
        });

        it("defaults to 'subtle' shadow (shadow-sm)", () => {
            renderBox();
            expect(getBox().className).toContain("shadow-sm");
        });
    });

    describe("background prop", () => {
        it("applies bg-white by default", () => {
            renderBox();
            expect(getBox().className).toContain("bg-white");
        });

        it("applies the correct bg class for a named color", () => {
            renderBox({ background: "gray-100" });
            expect(getBox()).toHaveClass("bg-gray-100");
        });

        it("applies the correct bg class for a custom value", () => {
            renderBox({ background: "blue-500" });
            expect(getBox()).toHaveClass("bg-blue-500");
        });

        it("applies no bg class when background is empty string", () => {
            renderBox({ background: "" });
            expect(getBox().className).not.toMatch(/\bbg-\S/);
        });
    });

    describe("className prop", () => {
        it("merges custom className with generated classes", () => {
            renderBox({ className: "my-custom-class" });
            const box = getBox();
            expect(box.className).toContain("my-custom-class");
            expect(box.className).toContain("p-4");
        });

        it("allows multiple custom classes", () => {
            renderBox({ className: "border border-red-500" });
            const box = getBox();
            expect(box.className).toContain("border");
            expect(box.className).toContain("border-red-500");
        });
    });

    describe("HTML attribute passthrough", () => {
        it("forwards id to the div", () => {
            renderBox({ id: "my-box" });
            expect(getBox()).toHaveAttribute("id", "my-box");
        });

        it("forwards aria-label to the div", () => {
            renderBox({ "aria-label": "card container" });
            expect(getBox()).toHaveAttribute("aria-label", "card container");
        });
        it("forwards role to the div", () => {
            renderBox({ role: "region" });
            expect(screen.getByRole("region")).toBeInTheDocument();
        });

        it("forwards onClick handler", async () => {
            const user = userEvent.setup();
            const onClick = vi.fn();
            renderBox({ onClick });
            await user.click(getBox());
            expect(onClick).toHaveBeenCalledTimes(1);
        });
    });

    describe("prop combinations", () => {
        it("applies all explicit props correctly together", () => {
            renderBox({
                width: "full",
                height: "large",
                padding: "lg",
                background: "slate-900",
                rounded: "lg",
                shadow: "strong",
            });
            const box = getBox();
            expect(box).toHaveClass("w-full");
            expect(box).toHaveClass("h-64");
            expect(box).toHaveClass("p-8");
            expect(box).toHaveClass("bg-slate-900");
            expect(box).toHaveClass("rounded-lg");
            expect(box).toHaveClass("shadow-lg");
        });

        it("does not apply widthMap class when arbitrary width is given", () => {
            renderBox({ width: "w-1/2" });
            const box = getBox();
            ["w-auto", "w-32", "w-64", "w-96", "w-full"].forEach((cls) =>
                expect(box).not.toHaveClass(cls)
            );
            expect(box).toHaveClass("w-1/2");
        });

        it("does not apply heightMap class when arbitrary height is given", () => {
            renderBox({ height: "h-48" });
            const box = getBox();
            ["h-auto", "h-16", "h-32", "h-64", "h-screen"].forEach((cls) =>
                expect(box).not.toHaveClass(cls)
            );
            expect(box).toHaveClass("h-48");
        });
    });
});