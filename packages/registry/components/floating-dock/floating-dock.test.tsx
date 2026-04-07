import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FloatingDock, type DockItem } from "./index";

vi.mock("framer-motion", async (importOriginal) => {
    const actual = await importOriginal<typeof import("framer-motion")>();
    return {
        ...actual,
        motion: {
            div: ({ children, style, className, onClick, onKeyDown, tabIndex, role, "aria-label": ariaLabel, "aria-current": ariaCurrent, "aria-pressed": ariaPressed, layout, ...rest }: React.ComponentPropsWithoutRef<"div"> & Record<string, unknown>) => (
                <div
                    style={style as React.CSSProperties}
                    className={className}
                    onClick={onClick as React.MouseEventHandler<HTMLDivElement>}
                    onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLDivElement>}
                    tabIndex={tabIndex}
                    role={role}
                    aria-label={ariaLabel}
                    aria-current={ariaCurrent as React.AriaAttributes["aria-current"]}
                    aria-pressed={ariaPressed as boolean}
                    data-layout={layout ? String(layout) : undefined}
                    {...rest}
                >
                    {children as React.ReactNode}
                </div>
            ),
            span: ({ children, style, className, ...rest }: React.ComponentPropsWithoutRef<"span"> & Record<string, unknown>) => (
                <span style={style as React.CSSProperties} className={className} {...rest}>
                    {children as React.ReactNode}
                </span>
            ),
        },
        Reorder: {
            Group: ({ children, onReorder: _onReorder, className, axis, values, ...rest }: React.ComponentPropsWithoutRef<"div"> & { onReorder?: (values: string[]) => void; values?: string[]; axis?: string } & Record<string, unknown>) => (
                <div className={className} data-axis={axis} data-values={JSON.stringify(values)} {...rest}>
                    {children as React.ReactNode}
                </div>
            ),
            Item: ({ children, className, layout, ...rest }: React.ComponentPropsWithoutRef<"div"> & Record<string, unknown>) => (
                <div className={className} data-layout={layout ? String(layout) : undefined} {...rest}>
                    {children as React.ReactNode}
                </div>
            ),
        },
        useMotionValue: (initial: number) => ({
            get: () => initial,
            set: vi.fn(),
        }),
        useSpring: (value: unknown) => value,
        useTransform: (value: unknown, _arg1: unknown, _arg2: unknown) => value,
    };
});

vi.mock("@radix-ui/react-tooltip", () => ({
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Root: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Trigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => <>{children}</>,
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Content: ({ children, sideOffset, ...rest }: React.ComponentPropsWithoutRef<"div"> & { sideOffset?: number }) => (
        <div role="tooltip" data-side-offset={sideOffset} {...rest}>{children}</div>
    ),
    Arrow: () => <span />,
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

const makeItems = (count = 3, overrides: Partial<DockItem>[] = []): DockItem[] =>
    Array.from({ length: count }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i}`,
        icon: <span data-testid={`icon-${i}`}>icon</span>,
        onClick: vi.fn(),
        ...overrides[i],
    }));

describe("FloatingDock", () => {

    describe("rendering", () => {
        it("renders a toolbar with aria-label 'Dock'", () => {
            render(<FloatingDock items={makeItems()} />);
            expect(screen.getByRole("toolbar", { name: /dock/i })).toBeInTheDocument();
        });

        it("renders all items by label", () => {
            const items = makeItems(3);
            render(<FloatingDock items={items} />);
            items.forEach(({ label }) =>
                expect(screen.getByLabelText(label)).toBeInTheDocument()
            );
        });

        it("renders each icon node", () => {
            render(<FloatingDock items={makeItems(3)} />);
            for (let i = 0; i < 3; i++) {
                expect(screen.getByTestId(`icon-${i}`)).toBeInTheDocument();
            }
        });

        it("renders nothing for an empty items array", () => {
            render(<FloatingDock items={[]} />);
            const toolbar = screen.getByRole("toolbar");
            expect(toolbar).toBeEmptyDOMElement();
        });

    });

    describe("variant classes", () => {
        const variants = ["solid", "outlined", "glass", "neon"] as const;

        it.each(variants)("applies variant '%s' class to the toolbar", (variant) => {
            const { container } = render(
                <FloatingDock items={makeItems(1)} variant={variant} />
            );
            const toolbar = container.firstChild as HTMLElement;
            const expectedClass = variant === "solid"
                ? "bg-dock-solid"
                : variant === "neon"
                    ? "bg-dock-neon-bg"
                    : variant === "glass"
                        ? "bg-dock-glass"
                        : "bg-transparent";
            expect(toolbar.className).toContain(expectedClass);
        });

        it("defaults to solid variant when none is specified", () => {
            const { container } = render(<FloatingDock items={makeItems(1)} />);
            const toolbar = container.firstChild as HTMLElement;
            expect(toolbar.className).toContain("bg-dock-solid");
        });
    });

    describe("orientation", () => {
        it("sets aria-orientation='horizontal' by default", () => {
            render(<FloatingDock items={makeItems(1)} />);
            expect(screen.getByRole("toolbar")).toHaveAttribute("aria-orientation", "horizontal");
        });

        it("sets aria-orientation='vertical' when orientation='vertical'", () => {
            render(<FloatingDock items={makeItems(1)} orientation="vertical" />);
            expect(screen.getByRole("toolbar")).toHaveAttribute("aria-orientation", "vertical");
        });

        it("applies horizontal layout classes for horizontal orientation", () => {
            const { container } = render(<FloatingDock items={makeItems(1)} orientation="horizontal" />);
            expect((container.firstChild as HTMLElement).className).toContain("flex-row");
        });

        it("applies vertical layout classes for vertical orientation", () => {
            const { container } = render(<FloatingDock items={makeItems(1)} orientation="vertical" />);
            expect((container.firstChild as HTMLElement).className).toContain("flex-col");
        });
    });

    describe("separator", () => {
        it("renders a vertical separator for horizontal dock", () => {
            const items: DockItem[] = [
                { id: "a", label: "A", icon: <span /> },
                { id: "b", label: "B", icon: <span />, separator: true },
            ];
            render(<FloatingDock items={items} orientation="horizontal" />);
            expect(screen.getByRole("separator", { hidden: true })).toHaveAttribute("aria-orientation", "vertical");
        });

        it("renders a horizontal separator for vertical dock", () => {
            const items: DockItem[] = [
                { id: "a", label: "A", icon: <span /> },
                { id: "b", label: "B", icon: <span />, separator: true },
            ];
            render(<FloatingDock items={items} orientation="vertical" />);
            expect(screen.getByRole("separator", { hidden: true })).toHaveAttribute("aria-orientation", "horizontal");
        });

        it("does not render a separator when separator prop is absent", () => {
            render(<FloatingDock items={makeItems(2)} />);
            expect(screen.queryByRole("separator", { hidden: true })).toBeNull();
        });
    });

    describe("badge", () => {
        it("renders badge with correct count", () => {
            const items: DockItem[] = [{ id: "n", label: "Notifications", icon: <span />, badge: 5 }];
            render(<FloatingDock items={items} />);
            expect(screen.getByText("5")).toBeInTheDocument();
        });

        it("renders '99+' for badge counts above 99", () => {
            const items: DockItem[] = [{ id: "n", label: "Notif", icon: <span />, badge: 150 }];
            render(<FloatingDock items={items} />);
            expect(screen.getByText("99+")).toBeInTheDocument();
        });

        it("renders '99' (not 99+) for exactly 99", () => {
            const items: DockItem[] = [{ id: "n", label: "Notif", icon: <span />, badge: 99 }];
            render(<FloatingDock items={items} />);
            expect(screen.getByText("99")).toBeInTheDocument();
        });

        it("does not render badge when badge is 0", () => {
            const items: DockItem[] = [{ id: "n", label: "Notif", icon: <span />, badge: 0 }];
            render(<FloatingDock items={items} />);
            expect(screen.queryByText("0")).toBeNull();
        });

        it("does not render badge when badge prop is absent", () => {
            render(<FloatingDock items={makeItems(1)} />);
            expect(screen.queryByText(/^\d+\+?$/)).toBeNull();
        });
    });

    describe("active state", () => {
        it("sets aria-pressed=true on active item", () => {
            const items: DockItem[] = [{ id: "home", label: "Home", icon: <span />, active: true, onClick: vi.fn() }];
            render(<FloatingDock items={items} />);
            expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-pressed", "true");
        });

        it("sets aria-current='true' on active item", () => {
            const items: DockItem[] = [{ id: "home", label: "Home", icon: <span />, active: true, onClick: vi.fn() }];
            render(<FloatingDock items={items} />);
            expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "true");
        });

        it("does not set aria-pressed on inactive button item", () => {
            const items: DockItem[] = [{ id: "home", label: "Home", icon: <span />, active: false, onClick: vi.fn() }];
            render(<FloatingDock items={items} />);
            expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-pressed", "false");
        });
    });

    describe("interaction", () => {
        it("calls onClick when item is clicked", async () => {
            const onClick = vi.fn();
            const items: DockItem[] = [{ id: "a", label: "A", icon: <span />, onClick }];
            render(<FloatingDock items={items} />);
            await userEvent.click(screen.getByRole("button", { name: "A" }));
            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it("calls onClick when Enter is pressed on item", async () => {
            const onClick = vi.fn();
            const items: DockItem[] = [{ id: "a", label: "A", icon: <span />, onClick }];
            render(<FloatingDock items={items} />);
            const btn = screen.getByRole("button", { name: "A" });
            btn.focus();
            await userEvent.keyboard("{Enter}");
            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it("calls onClick when Space is pressed on item", async () => {
            const onClick = vi.fn();
            const items: DockItem[] = [{ id: "a", label: "A", icon: <span />, onClick }];
            render(<FloatingDock items={items} />);
            const btn = screen.getByRole("button", { name: "A" });
            btn.focus();
            await userEvent.keyboard(" ");
            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it("does not throw when onClick is provided but some items lack it", async () => {
            const onClick = vi.fn();
            const items: DockItem[] = [
                { id: "a", label: "A", icon: <span />, onClick },
                { id: "b", label: "B", icon: <span /> },
            ];
            render(<FloatingDock items={items} />);
            await userEvent.click(screen.getByLabelText("A"));
            expect(onClick).toHaveBeenCalledTimes(1);

            await expect(userEvent.click(screen.getByLabelText("B"))).resolves.not.toThrow();
        });
    });

    describe("tooltip", () => {
        it("renders a tooltip with the item label", async () => {
            const items: DockItem[] = [{ id: "a", label: "Dashboard", icon: <span /> }];
            render(<FloatingDock items={items} />);
            await waitFor(() => {
                expect(screen.getByRole("tooltip")).toBeInTheDocument();
            });
            expect(screen.getByRole("tooltip")).toHaveTextContent("Dashboard");
        });
    });

    describe("mouse and touch events", () => {
        it("does not throw on mouse move over toolbar", () => {
            render(<FloatingDock items={makeItems(2)} />);
            expect(() =>
                fireEvent.mouseMove(screen.getByRole("toolbar"), { clientX: 100, clientY: 50 })
            ).not.toThrow();
        });

        it("does not throw on mouse leave from toolbar", () => {
            render(<FloatingDock items={makeItems(2)} />);
            expect(() =>
                fireEvent.mouseLeave(screen.getByRole("toolbar"))
            ).not.toThrow();
        });

        it("does not throw on touch move over toolbar", () => {
            render(<FloatingDock items={makeItems(2)} />);
            expect(() =>
                fireEvent.touchMove(screen.getByRole("toolbar"), {
                    touches: [{ clientX: 80, clientY: 40 }],
                })
            ).not.toThrow();
        });

        it("does not throw on touch end over toolbar", () => {
            render(<FloatingDock items={makeItems(2)} />);
            expect(() =>
                fireEvent.touchEnd(screen.getByRole("toolbar"))
            ).not.toThrow();
        });
    });

    describe("responsive icon sizes", () => {
        const setWidth = (width: number) =>
            Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });

        afterEach(() => setWidth(1024));

        it("uses smaller icon sizes on mobile viewports (< 768px)", () => {
            setWidth(375);
            act(() => {
                window.dispatchEvent(new Event("resize"));
            });
            render(<FloatingDock items={makeItems(1)} />);
            expect(screen.getByRole("toolbar")).toBeInTheDocument();
        });

        it("uses default icon sizes on desktop viewports (>= 768px)", () => {
            setWidth(1280);
            act(() => {
                window.dispatchEvent(new Event("resize"));
            });
            render(<FloatingDock items={makeItems(1)} />);
            expect(screen.getByRole("toolbar")).toBeInTheDocument();
        });

        it("cleans up resize listener on unmount", () => {
            const removeListener = vi.spyOn(window, "removeEventListener");
            const { unmount } = render(<FloatingDock items={makeItems(1)} />);
            unmount();
            expect(removeListener).toHaveBeenCalledWith("resize", expect.any(Function));
        });
    });

    describe("reorderable", () => {
        it("renders all item icons when reorderable=true", () => {
            render(<FloatingDock items={makeItems(3)} reorderable />);
            expect(screen.getAllByTestId(/^icon-/)).toHaveLength(3);
        });

        it("renders a plain div when reorderable=false (default)", () => {
            const { container } = render(<FloatingDock items={makeItems(2)} />);
            expect(container.firstChild?.nodeName).toBe("DIV");
        });

        it("does not call onReorder on initial render", () => {
            const onReorder = vi.fn();
            render(<FloatingDock items={makeItems(3)} reorderable onReorder={onReorder} />);
            expect(onReorder).not.toHaveBeenCalled();
        });
    });

    describe("storageKey / localStorage persistence", () => {
        const STORAGE_KEY = "test-dock-order";

        beforeEach(() => {
            localStorage.clear();
        });

        it("reads saved order from localStorage on mount", () => {
            const items = makeItems(3);
            const savedOrder = ["item-2", "item-0", "item-1"];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedOrder));

            render(<FloatingDock items={items} reorderable storageKey={STORAGE_KEY} />);
            expect(screen.getAllByTestId(/^icon-/)).toHaveLength(3);
        });

        it("does not crash when localStorage contains invalid JSON", () => {
            localStorage.setItem(STORAGE_KEY, "not-valid-json{{{");
            expect(() =>
                render(<FloatingDock items={makeItems(2)} reorderable storageKey={STORAGE_KEY} />)
            ).not.toThrow();
        });

        it("does not crash when localStorage contains an empty array", () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
            expect(() =>
                render(<FloatingDock items={makeItems(2)} reorderable storageKey={STORAGE_KEY} />)
            ).not.toThrow();
        });

        it("ignores storageKey when not provided", () => {
            expect(() =>
                render(<FloatingDock items={makeItems(2)} reorderable />)
            ).not.toThrow();
        });
    });

    describe("dynamic item list updates", () => {
        it("adds a new item when items prop grows", () => {
            const items = makeItems(2);
            const { rerender } = render(<FloatingDock items={items} />);
            expect(screen.getAllByTestId(/^icon-/)).toHaveLength(2);

            const newItems = [...items, { id: "item-99", label: "New", icon: <span data-testid="icon-99" /> }];
            rerender(<FloatingDock items={newItems} />);
            expect(screen.getAllByTestId(/^icon-/)).toHaveLength(3);
            expect(screen.getByLabelText("New")).toBeInTheDocument();
        });

        it("removes an item when items prop shrinks", () => {
            const items = makeItems(3);
            const { rerender } = render(<FloatingDock items={items} />);
            expect(screen.getAllByTestId(/^icon-/)).toHaveLength(3);

            rerender(<FloatingDock items={items.slice(0, 2)} />);
            expect(screen.getAllByTestId(/^icon-/)).toHaveLength(2);
            expect(screen.queryByLabelText("Item 2")).toBeNull();
        });

        it("updates item labels when items prop changes", () => {
            const items = makeItems(1);
            const { rerender } = render(<FloatingDock items={items} />);
            expect(screen.getByLabelText("Item 0")).toBeInTheDocument();

            const updated = [{ ...items[0], label: "Updated Label" }];
            rerender(<FloatingDock items={updated} />);
            expect(screen.getByLabelText("Updated Label")).toBeInTheDocument();
        });
    });

    describe("className prop", () => {
        it("applies custom className to the toolbar wrapper", () => {
            const { container } = render(
                <FloatingDock items={makeItems(1)} className="my-custom-class" />
            );
            expect((container.firstChild as HTMLElement).className).toContain("my-custom-class");
        });
    });

    describe("accessibility", () => {
        it("only interactive items are keyboard-focusable (tabIndex=0)", () => {
            const items: DockItem[] = [
                { id: "a", label: "Clickable", icon: <span />, onClick: vi.fn() },
                { id: "b", label: "Static", icon: <span /> },
            ];
            render(<FloatingDock items={items} />);
            expect(screen.getByLabelText("Clickable")).toHaveAttribute("tabindex", "0");
            expect(screen.getByLabelText("Static")).not.toHaveAttribute("tabindex");
        });

        it("only interactive items have role='button'", () => {
            const items: DockItem[] = [
                { id: "a", label: "Clickable", icon: <span />, onClick: vi.fn() },
                { id: "b", label: "Static", icon: <span /> },
            ];
            render(<FloatingDock items={items} />);
            expect(screen.getByRole("button", { name: "Clickable" })).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "Static" })).toBeNull();
        });

        it("each item has an aria-label matching its label", () => {
            const items = makeItems(3);
            render(<FloatingDock items={items} />);
            items.forEach(({ label }) =>
                expect(screen.getByLabelText(label)).toBeInTheDocument()
            );
        });

        it("toolbar has role='toolbar'", () => {
            render(<FloatingDock items={makeItems(1)} />);
            expect(screen.getByRole("toolbar")).toBeInTheDocument();
        });
    });
});