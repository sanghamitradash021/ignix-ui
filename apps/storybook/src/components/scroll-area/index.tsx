import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../utils/cn";

const scrollbarVariants = cva(
    "flex touch-none select-none transition-colors",
    {
        variants: {
            variant: {
                thin: "",
                thick: "",
                pill: "",
                line: "",
                hidden: "!opacity-0 !w-0 !h-0 pointer-events-none",
            },
            thumbColor: {
                default: "[&>div]:bg-border hover:[&>div]:bg-muted-foreground/50",
                subtle: "[&>div]:bg-muted-foreground/20 hover:[&>div]:bg-muted-foreground/40",
                accent: "[&>div]:bg-primary/50 hover:[&>div]:bg-primary/80",
                contrast: "[&>div]:bg-foreground/40 hover:[&>div]:bg-foreground/60",
            },
            size: {
                sm: "",
                md: "",
                lg: "",
            },
        },
        defaultVariants: {
            variant: "thin",
            thumbColor: "default",
            size: "md",
        },
    }
);

function getTrackClasses(
    orientation: "vertical" | "horizontal",
    variant: string | undefined | null,
    size: string | undefined | null
) {
    const v = variant ?? "thin";
    const s = size ?? "md";

    const thicknessMap: Record<string, Record<string, string>> = {
        thin: { sm: "1.5", md: "2", lg: "2.5" },
        thick: { sm: "2", md: "2.5", lg: "3" },
        pill: { sm: "2", md: "2.5", lg: "3" },
        line: { sm: "px", md: "0.5", lg: "1" },
        hidden: { sm: "0", md: "0", lg: "0" },
    };

    const t = thicknessMap[v]?.[s] ?? "2";

    if (orientation === "vertical") {
        return `h-full w-${t} border-l border-l-transparent p-[1px]`;
    }
    return `h-${t} flex-col border-t border-t-transparent p-[1px]`;
}

function getThumbClasses(variant: string | undefined | null) {
    const v = variant ?? "thin";
    const base = "relative flex-1";
    if (v === "pill") return `${base} rounded-full`;
    if (v === "line") return `${base} rounded-none`;
    return `${base} rounded-full`;
}

function getFadeMaskStyle(
    fadeMask: "top" | "bottom" | "fade" | "none" | undefined | null
): React.CSSProperties | undefined {
    if (!fadeMask || fadeMask === "none") return undefined;
    const size = "24px";
    const t = "transparent";
    const b = "black";
    switch (fadeMask) {
        case "top":
            return { maskImage: `linear-gradient(to bottom, ${t}, ${b} ${size})` };
        case "bottom":
            return { maskImage: `linear-gradient(to top, ${t}, ${b} ${size})` };
        case "fade":
            return {
                maskImage: `linear-gradient(to bottom, ${t}, ${b} ${size}, ${b} calc(100% - ${size}), ${t})`,
            };
        default:
            return undefined;
    }
}

const entranceVariants = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } },
    slide: {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: "easeOut" },
    },
    scale: {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.35, ease: "easeOut" },
    },
    none: null,
} as const;

export interface ScrollAreaProps
    extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>,
    VariantProps<typeof scrollbarVariants> {
    orientation?: "vertical" | "horizontal" | "both";
    fadeMask?: "top" | "bottom" | "fade" | "none";
    autoHide?: boolean;
    animation?: "fade" | "slide" | "scale" | "none";
    showProgress?: boolean;
    viewportRef?: React.Ref<HTMLDivElement>;
}

const ScrollArea = React.forwardRef<
    React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
    ScrollAreaProps
>(
    (
        {
            className,
            children,
            variant,
            thumbColor,
            size,
            orientation = "vertical",
            fadeMask,
            autoHide = false,
            animation = "none",
            showProgress = false,
            viewportRef,
            ...props
        },
        ref
    ) => {
        const [scrollProgress, setScrollProgress] = React.useState(0);
        const [isScrolling, setIsScrolling] = React.useState(false);
        const hideTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
        const internalViewportRef = React.useRef<HTMLDivElement>(null);

        const setViewportRef = React.useCallback(
            (node: HTMLDivElement | null) => {
                (internalViewportRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                if (typeof viewportRef === "function") viewportRef(node);
                else if (viewportRef && typeof viewportRef === "object")
                    (viewportRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            },
            [viewportRef]
        );

        const handleScroll = React.useCallback(() => {
            const el = internalViewportRef.current;
            if (!el) return;

            if (showProgress) {
                const max = el.scrollHeight - el.clientHeight;
                setScrollProgress(max > 0 ? el.scrollTop / max : 0);
            }

            if (autoHide) {
                setIsScrolling(true);
                clearTimeout(hideTimer.current);
                hideTimer.current = setTimeout(() => setIsScrolling(false), 1500);
            }
        }, [showProgress, autoHide]);

        React.useEffect(() => {
            const el = internalViewportRef.current;
            if (!el) return;
            el.addEventListener("scroll", handleScroll, { passive: true });
            return () => el.removeEventListener("scroll", handleScroll);
        }, [handleScroll]);

        const anim = entranceVariants[animation];
        const fadeMaskStyle = getFadeMaskStyle(fadeMask);

        const overflowClass =
            orientation === "horizontal"
                ? "overflow-x-auto overflow-y-hidden"
                : orientation === "both"
                    ? "overflow-auto"
                    : "";

        const showVertical = orientation === "vertical" || orientation === "both";
        const showHorizontal = orientation === "horizontal" || orientation === "both";

        return (
            <ScrollAreaPrimitive.Root
                ref={ref}
                className={cn("relative overflow-hidden", className)}
                {...props}
            >
                {showProgress && (
                    <motion.div
                        className="absolute top-0 left-0 right-0 z-10 h-0.5 origin-left bg-primary"
                        style={{ scaleX: scrollProgress }}
                        transition={{ duration: 0.1, ease: "linear" }}
                    />
                )}

                <ScrollAreaPrimitive.Viewport
                    ref={setViewportRef}
                    className={cn("h-full w-full rounded-[inherit]", overflowClass)}
                    style={fadeMaskStyle}
                >
                    {anim ? (
                        <AnimatePresence>
                            <motion.div
                                initial={anim.initial}
                                animate={anim.animate}
                                transition={anim.transition}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        children
                    )}
                </ScrollAreaPrimitive.Viewport>

                {showVertical && (
                    <ScrollBar
                        orientation="vertical"
                        variant={variant}
                        thumbColor={thumbColor}
                        size={size}
                        forceVisible={autoHide ? isScrolling : true}
                    />
                )}
                {showHorizontal && (
                    <ScrollBar
                        orientation="horizontal"
                        variant={variant}
                        thumbColor={thumbColor}
                        size={size}
                        forceVisible={autoHide ? isScrolling : true}
                    />
                )}

                <ScrollAreaPrimitive.Corner />
            </ScrollAreaPrimitive.Root>
        );
    }
);
ScrollArea.displayName = "ScrollArea";

interface ScrollBarProps
    extends Omit<
        React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
        "orientation"
    >,
    VariantProps<typeof scrollbarVariants> {
    orientation?: "vertical" | "horizontal";
    forceVisible?: boolean;
}

const ScrollBar = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
    ScrollBarProps
>(
    (
        {
            className,
            orientation = "vertical",
            variant,
            thumbColor,
            size,
            forceVisible = true,
            ...props
        },
        ref
    ) => (
        <ScrollAreaPrimitive.ScrollAreaScrollbar
            ref={ref}
            orientation={orientation}
            className={cn(
                scrollbarVariants({ variant, thumbColor, size }),
                getTrackClasses(orientation, variant, size),
                "transition-opacity duration-300",
                forceVisible ? "opacity-100" : "opacity-0",
                className
            )}
            {...props}
        >
            <ScrollAreaPrimitive.ScrollAreaThumb className={getThumbClasses(variant)} />
        </ScrollAreaPrimitive.ScrollAreaScrollbar>
    )
);
ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };
