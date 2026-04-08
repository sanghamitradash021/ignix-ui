import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination, type PaginationProps } from "./index";


vi.mock("@radix-ui/themes", () => ({
    Text: ({ children, className }: React.PropsWithChildren<{ className?: string; size?: string }>) => (
        <span className={className}>{children}</span>
    ),
}));

vi.mock("lucide-react", () => ({
    ChevronLeft: () => <svg data-testid="icon-chevron-left" />,
    ChevronRight: () => <svg data-testid="icon-chevron-right" />,
    ChevronsLeft: () => <svg data-testid="icon-chevrons-left" />,
    ChevronsRight: () => <svg data-testid="icon-chevrons-right" />,
}));

vi.mock("../button", () => ({
    Button: ({
        children,
        onClick,
        disabled,
        "aria-label": ariaLabel,
        variant,
        size,
    }: React.PropsWithChildren<{
        onClick?: () => void;
        disabled?: boolean;
        "aria-label"?: string;
        "aria-current"?: string;
        variant?: string;
        size?: string;
    }>) => (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            data-variant={variant}
            data-size={size}
        >
            {children}
        </button>
    ),
}));

const renderPagination = (props: Partial<PaginationProps> & Pick<PaginationProps, "currentPage" | "totalPages">) =>
    render(<Pagination onPageChange={vi.fn()} {...props} />);

const getFirstPageBtn = () => screen.getByRole("button", { name: /first page/i });
const getPrevPageBtn = () => screen.getByRole("button", { name: /previous page/i });
const getNextPageBtn = () => screen.getByRole("button", { name: /next page/i });
const getLastPageBtn = () => screen.getByRole("button", { name: /last page/i });
const getPageBtn = (n: number) => screen.getByRole("button", { name: `Page ${n}` });
const queryPageBtn = (n: number) => screen.queryByRole("button", { name: `Page ${n}` });
const getDots = () => screen.getAllByText("…");

describe("Pagination", () => {

    describe("null rendering", () => {
        it("returns null when totalPages is 1", () => {
            const { container } = renderPagination({ currentPage: 1, totalPages: 1 });
            expect(container).toBeEmptyDOMElement();
        });

        it("returns null when totalPages is 0", () => {
            const { container } = renderPagination({ currentPage: 1, totalPages: 0 });
            expect(container).toBeEmptyDOMElement();
        });

        it("renders when totalPages is 2", () => {
            renderPagination({ currentPage: 1, totalPages: 2 });
            expect(screen.getByRole("button", { name: /first page/i })).toBeInTheDocument();
        });
    });

    describe("navigation buttons", () => {
        it("renders all four navigation buttons", () => {
            renderPagination({ currentPage: 3, totalPages: 10 });
            expect(getFirstPageBtn()).toBeInTheDocument();
            expect(getPrevPageBtn()).toBeInTheDocument();
            expect(getNextPageBtn()).toBeInTheDocument();
            expect(getLastPageBtn()).toBeInTheDocument();
        });

        it("renders correct icons inside navigation buttons", () => {
            renderPagination({ currentPage: 3, totalPages: 10 });
            expect(screen.getByTestId("icon-chevrons-left")).toBeInTheDocument();
            expect(screen.getByTestId("icon-chevron-left")).toBeInTheDocument();
            expect(screen.getByTestId("icon-chevron-right")).toBeInTheDocument();
            expect(screen.getByTestId("icon-chevrons-right")).toBeInTheDocument();
        });
    });

    describe("disabled states", () => {
        it("disables first and previous buttons on the first page", () => {
            renderPagination({ currentPage: 1, totalPages: 5 });
            expect(getFirstPageBtn()).toBeDisabled();
            expect(getPrevPageBtn()).toBeDisabled();
        });

        it("enables next and last buttons on the first page", () => {
            renderPagination({ currentPage: 1, totalPages: 5 });
            expect(getNextPageBtn()).not.toBeDisabled();
            expect(getLastPageBtn()).not.toBeDisabled();
        });

        it("disables next and last buttons on the last page", () => {
            renderPagination({ currentPage: 5, totalPages: 5 });
            expect(getNextPageBtn()).toBeDisabled();
            expect(getLastPageBtn()).toBeDisabled();
        });

        it("enables first and previous buttons on the last page", () => {
            renderPagination({ currentPage: 5, totalPages: 5 });
            expect(getFirstPageBtn()).not.toBeDisabled();
            expect(getPrevPageBtn()).not.toBeDisabled();
        });

        it("enables all four navigation buttons on a middle page", () => {
            renderPagination({ currentPage: 3, totalPages: 5 });
            expect(getFirstPageBtn()).not.toBeDisabled();
            expect(getPrevPageBtn()).not.toBeDisabled();
            expect(getNextPageBtn()).not.toBeDisabled();
            expect(getLastPageBtn()).not.toBeDisabled();
        });
    });

    describe("button variants", () => {
        it("active page button has variant='default'", () => {
            renderPagination({ currentPage: 2, totalPages: 5 });
            expect(getPageBtn(2)).toHaveAttribute("data-variant", "default");
        });

        it("inactive page buttons have variant='ghost'", () => {
            renderPagination({ currentPage: 2, totalPages: 5 });
            expect(getPageBtn(1)).toHaveAttribute("data-variant", "ghost");
            expect(getPageBtn(3)).toHaveAttribute("data-variant", "ghost");
        });

        it("navigation buttons have variant='outline'", () => {
            renderPagination({ currentPage: 3, totalPages: 10 });
            expect(getFirstPageBtn()).toHaveAttribute("data-variant", "outline");
            expect(getPrevPageBtn()).toHaveAttribute("data-variant", "outline");
            expect(getNextPageBtn()).toHaveAttribute("data-variant", "outline");
            expect(getLastPageBtn()).toHaveAttribute("data-variant", "outline");
        });
    });

    describe("onPageChange callbacks", () => {
        it("calls onPageChange(1) when first-page button is clicked", async () => {
            const onPageChange = vi.fn();
            render(<Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />);
            await userEvent.click(getFirstPageBtn());
            expect(onPageChange).toHaveBeenCalledWith(1);
            expect(onPageChange).toHaveBeenCalledTimes(1);
        });

        it("calls onPageChange(currentPage - 1) when previous button is clicked", async () => {
            const onPageChange = vi.fn();
            render(<Pagination currentPage={4} totalPages={10} onPageChange={onPageChange} />);
            await userEvent.click(getPrevPageBtn());
            expect(onPageChange).toHaveBeenCalledWith(3);
        });

        it("calls onPageChange(currentPage + 1) when next button is clicked", async () => {
            const onPageChange = vi.fn();
            render(<Pagination currentPage={4} totalPages={10} onPageChange={onPageChange} />);
            await userEvent.click(getNextPageBtn());
            expect(onPageChange).toHaveBeenCalledWith(5);
        });

        it("calls onPageChange(totalPages) when last-page button is clicked", async () => {
            const onPageChange = vi.fn();
            render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChange} />);
            await userEvent.click(getLastPageBtn());
            expect(onPageChange).toHaveBeenCalledWith(10);
        });

        it("calls onPageChange with correct page number when a page button is clicked", async () => {
            const onPageChange = vi.fn();
            render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
            await userEvent.click(getPageBtn(4));
            expect(onPageChange).toHaveBeenCalledWith(4);
        });

        it("does not call onPageChange when first-page button is disabled (already on first page)", async () => {
            const onPageChange = vi.fn();
            render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
            await userEvent.click(getFirstPageBtn());
            expect(onPageChange).not.toHaveBeenCalled();
        });

        it("does not call onPageChange when last-page button is disabled (already on last page)", async () => {
            const onPageChange = vi.fn();
            render(<Pagination currentPage={5} totalPages={5} onPageChange={onPageChange} />);
            await userEvent.click(getLastPageBtn());
            expect(onPageChange).not.toHaveBeenCalled();
        });
    });

    describe("displayName", () => {
        it("has correct displayName", () => {
            expect(Pagination.displayName).toBe("Pagination");
        });
    });

    describe("pagination range — no dots (small totalPages)", () => {
        it("shows all pages when totalPages fits within window (siblingCount=1, totalPages=6)", () => {
            renderPagination({ currentPage: 1, totalPages: 6 });
            [1, 2, 3, 4, 5, 6].forEach((n) => expect(getPageBtn(n)).toBeInTheDocument());
            expect(screen.queryByText("…")).not.toBeInTheDocument();
        });

        it("shows all pages for totalPages=2", () => {
            renderPagination({ currentPage: 1, totalPages: 2 });
            expect(getPageBtn(1)).toBeInTheDocument();
            expect(getPageBtn(2)).toBeInTheDocument();
        });
    });

    describe("pagination range — both dots", () => {
        it("shows first + dots + siblings + dots + last on a middle page", () => {
            renderPagination({ currentPage: 5, totalPages: 10 });
            expect(getPageBtn(1)).toBeInTheDocument();
            expect(getPageBtn(10)).toBeInTheDocument();
            expect(getDots()).toHaveLength(2);
            expect(getPageBtn(4)).toBeInTheDocument();
            expect(getPageBtn(5)).toBeInTheDocument();
            expect(getPageBtn(6)).toBeInTheDocument();
        });

        it("current page is visible in the middle range", () => {
            renderPagination({ currentPage: 6, totalPages: 15 });
            expect(getPageBtn(6)).toBeInTheDocument();
            expect(getDots()).toHaveLength(2);
        });
    });

    describe("siblingCount prop", () => {
        it("defaults to siblingCount=1 (1 sibling each side)", () => {
            renderPagination({ currentPage: 5, totalPages: 10 });
            expect(getPageBtn(4)).toBeInTheDocument();
            expect(getPageBtn(5)).toBeInTheDocument();
            expect(getPageBtn(6)).toBeInTheDocument();
        });

        it("siblingCount=2 shows 2 siblings each side of the current page", () => {
            renderPagination({ currentPage: 6, totalPages: 15, siblingCount: 2 });
            expect(getPageBtn(4)).toBeInTheDocument();
            expect(getPageBtn(5)).toBeInTheDocument();
            expect(getPageBtn(6)).toBeInTheDocument();
            expect(getPageBtn(7)).toBeInTheDocument();
            expect(getPageBtn(8)).toBeInTheDocument();
        });

        it("siblingCount=0 shows only the current page in the middle range", () => {
            renderPagination({ currentPage: 5, totalPages: 10, siblingCount: 0 });
            expect(getPageBtn(5)).toBeInTheDocument();
            // pages 4 and 6 should not be visible
            expect(queryPageBtn(4)).not.toBeInTheDocument();
            expect(queryPageBtn(6)).not.toBeInTheDocument();
        });

        it("large siblingCount falls back to full range when window exceeds totalPages", () => {
            renderPagination({ currentPage: 3, totalPages: 5, siblingCount: 5 });
            [1, 2, 3, 4, 5].forEach((n) => expect(getPageBtn(n)).toBeInTheDocument());
            expect(screen.queryByText("…")).not.toBeInTheDocument();
        });
    });

    describe("dots rendering", () => {
        it("renders dots as &#8230; (…) character", () => {
            renderPagination({ currentPage: 5, totalPages: 10 });
            getDots().forEach((dot) => expect(dot.textContent).toBe("…"));
        });

        it("dots elements are not buttons", () => {
            renderPagination({ currentPage: 5, totalPages: 10 });
            getDots().forEach((dot) => expect(dot.tagName).not.toBe("BUTTON"));
        });
    });

    describe("wrapper layout", () => {
        it("renders a container div with flex and justify-center", () => {
            const { container } = renderPagination({ currentPage: 3, totalPages: 10 });
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper.className).toContain("flex");
            expect(wrapper.className).toContain("justify-center");
        });

        it("renders a container div with gap and py classes", () => {
            const { container } = renderPagination({ currentPage: 3, totalPages: 10 });
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper.className).toContain("gap-2");
            expect(wrapper.className).toContain("py-4");
        });
    });
});