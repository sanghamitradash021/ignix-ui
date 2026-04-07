
import React, { useState } from 'react';
import {
    HomeIcon,
    MagnifyingGlassIcon,
    BarChartIcon,
    ArchiveIcon,
    SpeakerLoudIcon,
    GearIcon,
    PersonIcon,
} from "@radix-ui/react-icons";
import { FloatingDock, type DockItem } from '@site/src/components/UI/floating-dock';
import VariantSelector from './VariantSelector';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

const FloatingDockDemo = () => {
    const [variant, setVariant] = useState('solid');
    const [orientation, setOrientation] = useState('horizontal');
    const [reorderable, setReorderable] = useState(false);
    const [activeId, setActiveId] = useState('home');

    const baseItems: DockItem[] = [
        { id: "home", icon: <HomeIcon width={20} height={20} />, label: "Home" },
        { id: "search", icon: <MagnifyingGlassIcon width={20} height={20} />, label: "Search" },
        { id: "analytics", icon: <BarChartIcon width={20} height={20} />, label: "Analytics" },
        { id: "inbox", icon: <ArchiveIcon width={20} height={20} />, label: "Inbox", badge: 12, separator: true },
        { id: "music", icon: <SpeakerLoudIcon width={20} height={20} />, label: "Music" },
        { id: "settings", icon: <GearIcon width={20} height={20} />, label: "Settings", separator: true },
        { id: "profile", icon: <PersonIcon width={20} height={20} />, label: "Profile" },
    ];

    const items: DockItem[] = baseItems.map((item) => ({
        ...item,
        active: item.id === activeId,
        onClick: () => setActiveId(item.id!),
    }));

    const variants = ['solid', 'glass', 'outlined', 'neon'];
    const orientations = ['horizontal', 'vertical'];
    const reorderOptions = ['no', 'yes'];

    const codeString = `
import { FloatingDock } from '@ignix-ui/floating-dock';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  ArchiveIcon,
  SpeakerLoudIcon,
  GearIcon,
  PersonIcon,
} from "@radix-ui/react-icons";

const items = [
  { id: "home", icon: <HomeIcon />, label: "Home", active: true },
  { id: "search", icon: <MagnifyingGlassIcon />, label: "Search" },
  { id: "analytics", icon: <BarChartIcon />, label: "Analytics" },
  { id: "inbox", icon: <ArchiveIcon />, label: "Inbox", badge: 12, separator: true },
  { id: "music", icon: <SpeakerLoudIcon />, label: "Music" },
  { id: "settings", icon: <GearIcon />, label: "Settings", separator: true },
  { id: "profile", icon: <PersonIcon />, label: "Profile" },
];

<FloatingDock 
  items={items} 
  variant="${variant}" 
  orientation="${orientation}"
  reorderable={${reorderable}}
/>
`;

    return (
        <div className="space-y-6 mb-8">
            <div className="flex flex-wrap gap-4 justify-start sm:justify-end">
                <VariantSelector
                    variants={variants}
                    selectedVariant={variant}
                    onSelectVariant={setVariant}
                    type="Variant"
                />
                <VariantSelector
                    variants={orientations}
                    selectedVariant={orientation}
                    onSelectVariant={setOrientation}
                    type="Orientation"
                />
                <VariantSelector
                    variants={reorderOptions}
                    selectedVariant={reorderable ? 'yes' : 'no'}
                    onSelectVariant={(v) => setReorderable(v === 'yes')}
                    type="Reorderable"
                />
            </div>

            <Tabs>
                <TabItem value="preview" label="Preview">
                    <div className={`p-12 border rounded-lg mt-4 flex items-center justify-center min-h-[300px] ${variant === 'glass' ? 'bg-slate-50 dark:bg-slate-900' : ''}`}>
                        <FloatingDock
                            items={items}
                            variant={variant as any}
                            orientation={orientation as any}
                            reorderable={reorderable}
                        />
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

export default FloatingDockDemo;
