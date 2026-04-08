import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './index';

const meta = {
    title: 'Components/ScrollArea',
    component: ScrollArea,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['thin', 'thick', 'pill', 'line', 'hidden'],
        },
        thumbColor: {
            control: 'select',
            options: ['default', 'subtle', 'accent', 'contrast'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
        orientation: {
            control: 'select',
            options: ['vertical', 'horizontal', 'both'],
        },
        fadeMask: {
            control: 'select',
            options: ['top', 'bottom', 'fade', 'none'],
        },
        autoHide: {
            control: 'boolean',
        },
        showProgress: {
            control: 'boolean',
        },
        animation: {
            control: 'select',
            options: ['fade', 'slide', 'scale', 'none'],
        },
    },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const VerticalContent = () => (
    <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Settings Menu</h4>
        {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="text-sm my-2">
                Setting item {i + 1}
                <hr className="my-2 border-border" />
            </div>
        ))}
    </div>
);

const HorizontalContent = () => (
    <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-32 shrink-0 rounded-md bg-secondary p-4 text-center text-sm font-medium">
                Card {i + 1}
            </div>
        ))}
    </div>
);

const BothContent = () => (
    <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-48 shrink-0">
                <div className="mb-4 font-semibold">Column {i + 1}</div>
                {Array.from({ length: 10 }).map((_, j) => (
                    <div key={j} className="text-sm my-2 mb-4 h-16 rounded-md bg-muted p-2">
                        Row {j + 1}
                    </div>
                ))}
            </div>
        ))}
    </div>
);

export const Default: Story = {
    args: {
        className: 'h-72 w-48 rounded-md border',
        children: <VerticalContent />,
    },
};

export const Horizontal: Story = {
    args: {
        className: 'w-96 whitespace-nowrap rounded-md border',
        orientation: 'horizontal',
        children: <HorizontalContent />,
    },
};

export const BothOrientations: Story = {
    args: {
        className: 'h-72 w-96 rounded-md border',
        orientation: 'both',
        children: <BothContent />,
    },
};

export const ThumbColors: Story = {
    render: () => (
        <div className="flex gap-4">
            <ScrollArea className="h-72 w-48 rounded-md border" thumbColor="default">
                <div className="p-4 font-semibold text-sm hover:underline">Default</div>
                <VerticalContent />
            </ScrollArea>
            <ScrollArea className="h-72 w-48 rounded-md border" thumbColor="subtle">
                <div className="p-4 font-semibold text-sm hover:underline">Subtle</div>
                <VerticalContent />
            </ScrollArea>
            <ScrollArea className="h-72 w-48 rounded-md border" thumbColor="accent">
                <div className="p-4 font-semibold text-sm hover:underline">Accent</div>
                <VerticalContent />
            </ScrollArea>
            <ScrollArea className="h-72 w-48 rounded-md border" thumbColor="contrast">
                <div className="p-4 font-semibold text-sm hover:underline">Contrast</div>
                <VerticalContent />
            </ScrollArea>
        </div>
    ),
};

export const VariantsAndSizes: Story = {
    render: () => (
        <div className="flex gap-4">
            <ScrollArea className="h-72 w-48 rounded-md border bg-slate-50 dark:bg-slate-900" variant="thin" size="md">
                <div className="p-4 text-sm font-semibold">Thin (md)</div>
                <VerticalContent />
            </ScrollArea>
            <ScrollArea className="h-72 w-48 rounded-md border bg-slate-50 dark:bg-slate-900" variant="thick" size="lg">
                <div className="p-4 text-sm font-semibold">Thick (lg)</div>
                <VerticalContent />
            </ScrollArea>
            <ScrollArea className="h-72 w-48 rounded-md border bg-slate-50 dark:bg-slate-900" variant="pill" size="sm">
                <div className="p-4 text-sm font-semibold">Pill (sm)</div>
                <VerticalContent />
            </ScrollArea>
            <ScrollArea className="h-72 w-48 rounded-md border bg-slate-50 dark:bg-slate-900" variant="line">
                <div className="p-4 text-sm font-semibold">Line</div>
                <VerticalContent />
            </ScrollArea>
        </div>
    ),
};

export const Features: Story = {
    render: () => (
        <div className="flex gap-4">
            <ScrollArea className="h-72 w-48 rounded-md border" showProgress={true}>
                <div className="p-4 text-sm font-semibold">Progress Bar</div>
                <VerticalContent />
            </ScrollArea>

            <ScrollArea className="h-72 w-48 rounded-md border" autoHide={true}>
                <div className="p-4 text-sm font-semibold">Auto Hide</div>
                <VerticalContent />
            </ScrollArea>

            <ScrollArea className="h-72 w-48 rounded-md border dark:bg-slate-950 bg-slate-100" fadeMask="fade">
                <div className="p-4 text-sm font-semibold">Fade Edge Mask</div>
                <VerticalContent />
            </ScrollArea>
        </div>
    ),
};

export const EntranceAnimation: Story = {
    args: {
        className: 'h-72 w-48 rounded-md border',
        animation: 'slide',
        children: <VerticalContent />,
    },
};
