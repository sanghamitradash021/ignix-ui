import React, { useState } from 'react';
import { ScrollArea } from '@site/src/components/UI/scroll-area';
import VariantSelector from './VariantSelector';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import { cn } from '@site/src/utils/cn';

const scrollAreaVariants = [
    { value: 'thin', label: 'Thin' },
    { value: 'thick', label: 'Thick' },
    { value: 'pill', label: 'Pill' },
    { value: 'line', label: 'Line' },
    { value: 'hidden', label: 'Hidden' },
];

const scrollAreaSizes = [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
];

const scrollAreaColors = [
    { value: 'default', label: 'Default' },
    { value: 'subtle', label: 'Subtle' },
    { value: 'accent', label: 'Accent' },
    { value: 'contrast', label: 'Contrast' },
];

const scrollAreaOrientations = [
    { value: 'vertical', label: 'Vertical' },
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'both', label: 'Both' },
];

const scrollAreaFadeMasks = [
    { value: 'none', label: 'None' },
    { value: 'auto', label: 'Auto (Dynamic)' },
    { value: 'fade', label: 'Fade (Both)' },
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
];

const scrollAreaAnimations = [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'scale', label: 'Scale' },
];

const contacts = [
    { name: "Alice Freeman", role: "Software Engineer", status: "online" },
    { name: "Bob Smith", role: "Product Manager", status: "offline" },
    { name: "Charlie Davis", role: "Designer", status: "online" },
    { name: "Diana Prince", role: "Researcher", status: "away" },
    { name: "Evan Wright", role: "QA Tester", status: "online" },
    { name: "Fiona Gallagher", role: "HR Manager", status: "offline" },
    { name: "George Costanza", role: "Sales", status: "busy" },
    { name: "Hannah Abbott", role: "Support", status: "online" },
    { name: "Ian Malcolm", role: "Data Scientist", status: "away" },
    { name: "Jenny Slate", role: "Content Writer", status: "online" },
    { name: "Kevin Hart", role: "Marketing", status: "offline" },
    { name: "Laura Croft", role: "Security Ops", status: "online" },
    { name: "Michael Scott", role: "Regional Manager", status: "busy" },
    { name: "Nina Dobrev", role: "PR Specialist", status: "online" },
    { name: "Oscar Martinez", role: "Accountant", status: "offline" },
];

const VerticalContent = () => (
    <div className="p-4 pr-6">
        <h4 className="mb-4 text-sm font-semibold leading-none flex items-center justify-between">
            <span>Team Members</span>
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full">{contacts.length}</span>
        </h4>
        <div className="space-y-3">
            {contacts.map((contact, i) => (
                <div key={i} className="flex items-center gap-3 group cursor-pointer rounded-md transition-colors hover:bg-muted/50 -mx-2 px-2 py-1.5">
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground shadow-sm border border-border/50">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                        <span className={cn(
                            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background",
                            contact.status === 'online' ? 'bg-green-500' :
                                contact.status === 'away' ? 'bg-yellow-500' :
                                    contact.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                        )} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{contact.name}</span>
                        <span className="text-[11px] text-muted-foreground mt-1">{contact.role}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const artworks = [
    {
        artist: "Milad Fakurian",
        art: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
        title: "Liquid Canvas",
    },
    {
        artist: "Pawel Czerwinski",
        art: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=80",
        title: "Abstract Lines",
    },
    {
        artist: "Joel Filipe",
        art: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80",
        title: "Crystal Clear",
    },
    {
        artist: "Eberhard Grossgasteiger",
        art: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80",
        title: "Night Range",
    },
    {
        artist: "Maryam Sicard",
        art: "https://plus.unsplash.com/premium_photo-1663839412090-27840de8cba0?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        title: "Sprinkles",
    },
];

const HorizontalContent = () => (
    <div className="flex w-max space-x-4 p-4 pb-6">
        {artworks.map((artwork, i) => (
            <div key={i} className="w-[180px] shrink-0 rounded-md overflow-hidden bg-background border shadow-sm">
                <div className="overflow-hidden h-[240px] w-full">
                    <img
                        src={artwork.art}
                        alt={artwork.title}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                </div>
                <div className="p-3">
                    <h5 className="font-semibold text-sm text-foreground m-0 leading-tight">{artwork.title}</h5>
                    <p className="text-xs text-muted-foreground m-0 mt-1">{artwork.artist}</p>
                </div>
            </div>
        ))}
    </div>
);

const BothContent = () => (
    <div className="flex w-max space-x-4 p-4 pb-8 pr-8">
        {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-64 shrink-0 flex flex-col">
                <div className="mb-4 font-semibold flex items-center justify-between">
                    <span className="text-foreground text-sm">Column {i + 1}</span>
                    <span className="bg-muted text-muted-foreground text-[11px] px-2 py-0.5 rounded-full font-medium">10</span>
                </div>
                <div className="space-y-3">
                    {Array.from({ length: 10 }).map((_, j) => (
                        <div key={j} className="text-sm rounded-lg bg-card border shadow-sm p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all">
                            <p className="font-medium text-card-foreground leading-snug">Data Item {i + 1}.{j + 1}: Description</p>
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex -space-x-1.5">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-background flex items-center justify-center text-[9px] font-bold text-blue-700 dark:text-blue-300 shadow-sm">
                                        {String.fromCharCode(65 + (i * 2 % 26))}{String.fromCharCode(65 + ((i * 2 + 1) % 26))}
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 border-2 border-background flex items-center justify-center text-[9px] font-bold text-emerald-700 dark:text-emerald-300 shadow-sm">
                                        {String.fromCharCode(65 + (j * 2 % 26))}{String.fromCharCode(65 + ((j * 2 + 1) % 26))}
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono text-muted-foreground">ID-{(i + 1) * 100 + j}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

const ScrollAreaDemo = () => {
    const [variant, setVariant] = useState('thin');
    const [size, setSize] = useState('md');
    const [thumbColor, setThumbColor] = useState('default');
    const [orientation, setOrientation] = useState('vertical');
    const [fadeMask, setFadeMask] = useState('auto');
    const [animation, setAnimation] = useState('none');

    // Booleans
    const [autoHide, setAutoHide] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [showScrollButtons, setShowScrollButtons] = useState(false);
    const [expandOnHover, setExpandOnHover] = useState(true);

    const codeString = `
<ScrollArea 
  variant="${variant}"
  size="${size}"
  thumbColor="${thumbColor}"
  orientation="${orientation}"
  fadeMask="${fadeMask}"
  animation="${animation}"
  ${autoHide ? 'autoHide' : ''}
  ${showProgress ? 'showProgress' : ''}
  ${showScrollButtons ? 'showScrollButtons' : ''}
  ${!expandOnHover ? 'expandOnHover={false}' : ''}
  className="${orientation === 'horizontal' ? 'w-full whitespace-nowrap' : orientation === 'both' ? 'h-72 w-full' : 'h-72 w-48'} rounded-md border"
>
  {/* Content goes here */}
</ScrollArea>
`.trim().replace(/\n\s*\n/g, '\n');

    return (
        <div className="space-y-8 mb-8">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 justify-start sm:justify-end">
                <div className="space-y-2">
                    <VariantSelector
                        variants={scrollAreaVariants.map((v) => v.value)}
                        selectedVariant={variant}
                        onSelectVariant={setVariant}
                        type="Variant"
                    />
                </div>

                <div className="space-y-2">
                    <VariantSelector
                        variants={scrollAreaSizes.map((s) => s.value)}
                        selectedVariant={size}
                        onSelectVariant={setSize}
                        type="Size"
                    />
                </div>

                <div className="space-y-2">
                    <VariantSelector
                        variants={scrollAreaColors.map((c) => c.value)}
                        selectedVariant={thumbColor}
                        onSelectVariant={setThumbColor}
                        type="Thumb Color"
                    />
                </div>

                <div className="space-y-2">
                    <VariantSelector
                        variants={scrollAreaOrientations.map((o) => o.value)}
                        selectedVariant={orientation}
                        onSelectVariant={setOrientation}
                        type="Orientation"
                    />
                </div>

                <div className="space-y-2">
                    <VariantSelector
                        variants={scrollAreaFadeMasks.map((f) => f.value)}
                        selectedVariant={fadeMask}
                        onSelectVariant={setFadeMask}
                        type="Fade Mask"
                    />
                </div>

                <div className="space-y-2">
                    <VariantSelector
                        variants={scrollAreaAnimations.map((a) => a.value)}
                        selectedVariant={animation}
                        onSelectVariant={setAnimation}
                        type="Animation"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-6 items-center p-4 bg-muted/50 rounded-lg border">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={autoHide}
                        onChange={(e) => setAutoHide(e.target.checked)}
                        className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Auto Hide</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showProgress}
                        onChange={(e) => setShowProgress(e.target.checked)}
                        className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Show Progress</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showScrollButtons}
                        onChange={(e) => setShowScrollButtons(e.target.checked)}
                        className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Show Scroll Buttons</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={expandOnHover}
                        onChange={(e) => setExpandOnHover(e.target.checked)}
                        className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Expand on Hover</span>
                </label>
            </div>

            {/* Demo */}
            <Tabs>
                <TabItem value="preview" label="Preview">
                    <div className="p-6 border rounded-lg mt-4 bg-background flex justify-center items-center overflow-hidden min-h-[400px]">
                        <ScrollArea
                            variant={variant as any}
                            size={size as any}
                            thumbColor={thumbColor as any}
                            orientation={orientation as any}
                            fadeMask={fadeMask as any}
                            animation={animation as any}
                            autoHide={autoHide}
                            showProgress={showProgress}
                            showScrollButtons={showScrollButtons}
                            expandOnHover={expandOnHover}
                            className={
                                orientation === 'horizontal'
                                    ? 'w-full max-w-xl whitespace-nowrap rounded-md border shadow-sm'
                                    : orientation === 'both'
                                        ? 'h-72 w-full max-w-xl rounded-md border shadow-sm'
                                        : 'h-72 w-64 rounded-md border shadow-sm'
                            }
                        >
                            {orientation === 'horizontal' && <HorizontalContent />}
                            {orientation === 'vertical' && <VerticalContent />}
                            {orientation === 'both' && <BothContent />}
                        </ScrollArea>
                    </div>
                </TabItem>

                <TabItem value="code" label="Code">
                    <div className="mt-4">
                        <CodeBlock language="tsx" className="text-sm">
                            {codeString}
                        </CodeBlock>
                    </div>
                </TabItem>
            </Tabs>
        </div>
    );
};

export { ScrollAreaDemo };
