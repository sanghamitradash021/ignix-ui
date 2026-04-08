import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import React from "react";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "./index";

vi.mock("framer-motion", () => ({
    motion: {
        div: React.forwardRef(({ children, ...props }: any, ref: any) => (
            <div {...props} ref={ref}>
                {children}
            </div>
        )),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock("lucide-react", () => ({
    ChevronDown: () => <span data-testid="chevron-down" />,
}));

describe("Accordion Component", () => {
    const AccordionDemo = ({
        type = "single",
        collapsible = false,
        variant = "fade" as any,
        ...props
    }: {
        type?: "single" | "multiple";
        collapsible?: boolean;
        variant?: any;
        [key: string]: any;
    }) => (
        <Accordion
            type={type as any}
            collapsible={type === "single" ? collapsible : undefined}
            {...props}
        >
            <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent variant={variant}>
                    Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent variant={variant}>
                    Yes. It comes with default styles that match the aesthetic.
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );

    it("renders all accordion triggers", () => {
        render(<AccordionDemo />);
        expect(screen.getByText("Is it accessible?")).toBeInTheDocument();
        expect(screen.getByText("Is it styled?")).toBeInTheDocument();
    });

    it("expands an item when clicked", async () => {
        const user = userEvent.setup();
        render(<AccordionDemo collapsible />);

        const trigger = screen.getByRole("button", { name: /is it accessible/i });

        await user.click(trigger);

        expect(trigger).toHaveAttribute("data-state", "open");
        expect(screen.getByText(/Yes. It adheres to/)).toBeInTheDocument();
    });

    it("collapses an item when clicked again (if collapsible)", async () => {
        const user = userEvent.setup();
        render(<AccordionDemo collapsible />);

        const trigger = screen.getByRole("button", { name: /is it accessible/i });

        // Open
        await user.click(trigger);
        expect(trigger).toHaveAttribute("data-state", "open");

        // Close
        await user.click(trigger);
        expect(trigger).toHaveAttribute("data-state", "closed");
    });

    it("closes other items in single mode when a new one is opened", async () => {
        const user = userEvent.setup();
        render(<AccordionDemo type="single" />);

        const trigger1 = screen.getByRole("button", { name: /is it accessible/i });
        const trigger2 = screen.getByRole("button", { name: /is it styled/i });

        // Open item 1
        await user.click(trigger1);
        expect(trigger1).toHaveAttribute("data-state", "open");

        // Open item 2
        await user.click(trigger2);
        expect(trigger2).toHaveAttribute("data-state", "open");
        expect(trigger1).toHaveAttribute("data-state", "closed");
    });

    it("allows multiple items to be open in multiple mode", async () => {
        const user = userEvent.setup();
        render(<AccordionDemo type="multiple" />);

        const trigger1 = screen.getByRole("button", { name: /is it accessible/i });
        const trigger2 = screen.getByRole("button", { name: /is it styled/i });

        await user.click(trigger1);
        await user.click(trigger2);

        expect(trigger1).toHaveAttribute("data-state", "open");
        expect(trigger2).toHaveAttribute("data-state", "open");
    });

    it("passes correct accessibility attributes", () => {
        render(<AccordionDemo />);
        const trigger = screen.getByRole("button", { name: /is it accessible/i });

        expect(trigger).toHaveAttribute("aria-expanded", "false");
        expect(trigger).toHaveAttribute("aria-controls");
    });

    it("responds to keyboard navigation", async () => {
        const user = userEvent.setup();
        render(<AccordionDemo />);

        const trigger = screen.getByRole("button", { name: /is it accessible/i });
        trigger.focus();

        await user.keyboard("{Enter}");
        expect(trigger).toHaveAttribute("data-state", "open");

        await user.keyboard(" ");
    });

    it("handles different animation variants without crashing", () => {
        const { rerender } = render(<AccordionDemo variant="bounce" type="single" defaultValue="item-1" /> as any);
        expect(screen.getByText(/Yes. It adheres to/)).toBeInTheDocument();

        rerender(<AccordionDemo variant="scaleIn" type="single" defaultValue="item-1" /> as any);
        expect(screen.getByText(/Yes. It adheres to/)).toBeInTheDocument();

        rerender(<AccordionDemo variant="elastic" type="single" defaultValue="item-1" /> as any);
        expect(screen.getByText(/Yes. It adheres to/)).toBeInTheDocument();
    });

    it("applies custom classNames", () => {
        render(
            <Accordion type="single" defaultValue="item-1">
                <AccordionItem value="item-1" className="custom-item">
                    <AccordionTrigger className="custom-trigger">Trigger</AccordionTrigger>
                    <AccordionContent className="custom-content">Content</AccordionContent>
                </AccordionItem>
            </Accordion>
        );

        const item = screen.getByText("Trigger").closest('.AccordionItem');
        const trigger = screen.getByText("Trigger").closest('.AccordionTrigger');

        expect(item).toHaveClass("custom-item");
        expect(trigger).toHaveClass("custom-trigger");
        expect(screen.getByText("Content").parentElement).toHaveClass("custom-content");
    });
});
