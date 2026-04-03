import type { Meta, StoryObj } from "@storybook/react";
import {
    HomeIcon,
    MagnifyingGlassIcon,
    BarChartIcon,
    ArchiveIcon,
    SpeakerLoudIcon,
    GearIcon,
    PersonIcon,
    BellIcon,
    BookmarkIcon,
    LayersIcon,
    LightningBoltIcon,
    GlobeIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import { FloatingDock, type DockItem } from "./index";

// Shared Icons
const baseItems: DockItem[] = [
    { id: "home", icon: <HomeIcon width={20} height={20} />, label: "Home", active: true },
    { id: "search", icon: <MagnifyingGlassIcon width={20} height={20} />, label: "Search" },
    { id: "analytics", icon: <BarChartIcon width={20} height={20} />, label: "Analytics" },
    { id: "inbox", icon: <ArchiveIcon width={20} height={20} />, label: "Inbox", badge: 12, separator: true },
    { id: "music", icon: <SpeakerLoudIcon width={20} height={20} />, label: "Music" },
    { id: "settings", icon: <GearIcon width={20} height={20} />, label: "Settings", separator: true },
    { id: "profile", icon: <PersonIcon width={20} height={20} />, label: "Profile" },
];

const perIconItems: DockItem[] = [
    { id: "home", icon: <HomeIcon width={20} height={20} />, label: "Home", color: "#3b82f6", active: true },
    { id: "bell", icon: <BellIcon width={20} height={20} />, label: "Alerts", color: "orange", badge: 3 },
    { id: "bookmark", icon: <BookmarkIcon width={20} height={20} />, label: "Saved", color: "#10b981" },
    { id: "layers", icon: <LayersIcon width={20} height={20} />, label: "Projects", color: "#8b5cf6", separator: true },
    { id: "zap", icon: <LightningBoltIcon width={20} height={20} />, label: "Actions", color: "#ec4899" },
    { id: "globe", icon: <GlobeIcon width={20} height={20} />, label: "Web", color: "#06b6d4" },
];

// Meta
const meta: Meta<typeof FloatingDock> = {
    title: "Navigation/FloatingDock",
    component: FloatingDock,
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
        docs: {
            description: {
                component:
                    "A macOS-style animated navigation dock built on Radix UI and Framer Motion. Supports four visual appearances, horizontal/vertical orientation, active state, badges, dividers, per-icon colours, and optional drag-to-reorder.",
            },
        },
    },
    argTypes: {
        variant: {
            control: "select",
            options: ["solid", "glass", "outlined", "neon"],
            description: "Visual appearance variant",
        },
        orientation: {
            control: "radio",
            options: ["horizontal", "vertical"],
            description: "Dock axis",
        },
        reorderable: {
            control: "boolean",
            description: "Enable drag-to-reorder (adds Framer Motion Reorder overhead)",
        },
    },
};

export default meta;
type Story = StoryObj<typeof FloatingDock>;


// Appearnce stories

export const Solid: Story = {
    args: { items: baseItems, variant: "solid", orientation: "horizontal" },
};

export const Glass: Story = {
    args: { items: baseItems, variant: "glass", orientation: "horizontal" },
    parameters: {
        backgrounds: {
            default: "gradient",
            values: [
                {
                    name: "gradient",
                    value: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
                },
            ],
        },
    },
};

export const Outlined: Story = {
    args: { items: baseItems, variant: "outlined", orientation: "horizontal" },
};

export const Neon: Story = {
    args: { items: baseItems, variant: "neon", orientation: "horizontal" },
    parameters: {
        backgrounds: { default: "dark", values: [{ name: "dark", value: "#03020a" }] },
    },
};

// Orientation stories

export const VerticalSolid: Story = {
    name: "Vertical / Solid",
    args: { items: baseItems, variant: "solid", orientation: "vertical" },
};

export const VerticalGlass: Story = {
    name: "Vertical / Glass",
    args: { items: baseItems, variant: "glass", orientation: "vertical" },
    parameters: {
        backgrounds: {
            default: "gradient",
            values: [
                {
                    name: "gradient",
                    value: "linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)",
                },
            ],
        },
    },
};

export const VerticalNeon: Story = {
    name: "Vertical / Neon",
    args: { items: baseItems, variant: "neon", orientation: "vertical" },
    parameters: {
        backgrounds: { default: "dark", values: [{ name: "dark", value: "#03020a" }] },
    },
};

// Feature stories

export const WithBadges: Story = {
    name: "Feature / Badges",
    args: {
        variant: "solid",
        orientation: "horizontal",
        items: [
            { id: "home", icon: <HomeIcon width={20} height={20} />, label: "Home", active: true },
            { id: "inbox", icon: <ArchiveIcon width={20} height={20} />, label: "Inbox", badge: 5 },
            { id: "bell", icon: <BellIcon width={20} height={20} />, label: "Alerts", badge: 99 },
            { id: "bell2", icon: <BellIcon width={20} height={20} />, label: "Over 99", badge: 142 },
            { id: "music", icon: <SpeakerLoudIcon width={20} height={20} />, label: "Music", badge: 0 },
            { id: "profile", icon: <PersonIcon width={20} height={20} />, label: "Profile" },
        ],
    },
    parameters: {
        docs: {
            description: { story: "Badges cap at 99+. A badge of 0 renders nothing." },
        },
    },
};

export const PerIconColor: Story = {
    name: "Feature / Per-icon color",
    args: { items: perIconItems, variant: "solid", orientation: "horizontal" },
    parameters: {
        docs: {
            description: {
                story:
                    "Pass any valid CSS color (Hex, RGB, HSL, or name) on each DockItem. The icon background and border are tinted automatically using CSS color-mix.",
            },
        },
    },
};

export const WithSeparators: Story = {
    name: "Feature / Separators",
    args: { items: baseItems, variant: "solid", orientation: "horizontal" },
    parameters: {
        docs: {
            description: {
                story:
                    "Set separator: true on any item to render a 1px divider before it, grouping icons into clusters.",
            },
        },
    },
};

export const Reorderable: Story = {
    name: "Feature / Reorderable",
    args: {
        items: baseItems,
        variant: "solid",
        orientation: "horizontal",
        reorderable: true,
    },
    parameters: {
        docs: {
            description: {
                story:
                    "Pass reorderable to enable drag-to-reorder.",
            },
        },
    },
};

// Interactive playground

export const DockPlayground: Story = {
    name: "Dock Playground",
    render: (args) => {
        const [activeId, setActiveId] = useState("home");

        const items: DockItem[] = baseItems.map((item) => ({
            ...item,
            active: item.id === activeId,
            onClick: () => setActiveId(item.id!),
        }));

        return <FloatingDock {...args} items={items} />;
    },
    args: { variant: "solid", orientation: "horizontal", reorderable: false },
    parameters: {
        docs: {
            description: {
                story:
                    "Click any icon to move the active state. Use the controls panel to switch variant, orientation, and reorderable.",
            },
        },
    },
};

// All variants grid 

export const AllVariants: Story = {
    name: "All variants",
    render: () => (
        <div className="flex flex-col gap-10 items-center py-8">
            <div className="flex flex-col gap-2 items-center">
                <span className="text-xs text-muted-foreground font-mono">solid</span>
                <FloatingDock items={baseItems} variant="solid" orientation="horizontal" />
            </div>
            <div className="flex flex-col gap-2 items-center rounded-xl p-6"
                style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)" }}>
                <span className="text-xs text-white/70 font-mono">glass</span>
                <FloatingDock items={baseItems} variant="glass" orientation="horizontal" />
            </div>
            <div className="flex flex-col gap-2 items-center">
                <span className="text-xs text-muted-foreground font-mono">outlined</span>
                <FloatingDock items={baseItems} variant="outlined" orientation="horizontal" />
            </div>
            <div className="flex flex-col gap-2 items-center rounded-xl p-6 bg-[#03020a]">
                <span className="text-xs text-white/30 font-mono">neon</span>
                <FloatingDock items={baseItems} variant="neon" orientation="horizontal" />
            </div>
        </div>
    ),
    parameters: { layout: "padded" },
};