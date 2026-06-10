import { useState, useRef, useEffect } from 'react';

export interface TabOption {
    id: string;
    label: string;
}

export interface ToggleTabsProps {
    options: TabOption[];
    activeId: string;
    onChange: (id: string) => void;
}

/**
 * A segmented control toggle with an animated active indicator.
 */
export const ToggleTabs = ({ options, activeId, onChange }: ToggleTabsProps) => {
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    useEffect(() => {
        const updateIndicator = (): void => {
            const activeIndex = options.findIndex(opt => opt.id === activeId);
            const currentTab = tabsRef.current[activeIndex];

            if (currentTab) {
                setIndicatorStyle({
                    left: currentTab.offsetLeft,
                    width: currentTab.offsetWidth
                });
            }
        };

        updateIndicator();
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [activeId, options]);

    return (
        <div className="nav-tabs">
            <div
                className="nav-tabs-indicator animate shadow-1"
                style={{
                    left: `${indicatorStyle.left}px`,
                    width: `${indicatorStyle.width}px`
                }}
            />
            {options.map((option, index) => (
                <button
                    key={option.id}
                    ref={el => { tabsRef.current[index] = el }}
                    className={`nav-tab ${activeId === option.id ? 'active' : ''}`}
                    onClick={() => onChange(option.id)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};