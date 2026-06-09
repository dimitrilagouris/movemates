import { Link } from 'react-router-dom';
import { RiArrowRightSLine, RiRunLine } from "react-icons/ri";
import './Breadcrumbs.css';

import { ReactNode } from 'react';

export interface BreadcrumbItem {
    label: string;
    path?: string;
    icon?: ReactNode;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
    const renderItem = (item: BreadcrumbItem, index: number | string, isCurrent: boolean) => {
        return (
            <li key={`item-${index}`} className="breadcrumbs-item">
                <RiArrowRightSLine className="breadcrumbs-separator" />
                {isCurrent || !item.path ? (
                    <span className="breadcrumbs-current" aria-current="page">
                        {item.icon && <span className="breadcrumbs-icon">{item.icon}</span>}
                        <span>{item.label}</span>
                    </span>
                ) : (
                    <Link to={item.path} className="breadcrumbs-link">
                        {item.icon && <span className="breadcrumbs-icon">{item.icon}</span>}
                        <span>{item.label}</span>
                    </Link>
                )}
            </li>
        );
    };

    const renderItems = () => {
        if (items.length <= 3) {
            return items.map((item, index) => renderItem(item, index, index === items.length - 1));
        }

        const first = items[0];
        const last = items[items.length - 2];
        const current = items[items.length - 1];

        return (
            <>
                {renderItem(first, 0, false)}
                <li key="ellipsis" className="breadcrumbs-item">
                    <RiArrowRightSLine className="breadcrumbs-separator" />
                    <span className="breadcrumbs-ellipsis" style={{ color: 'var(--colour-zinc-400)', letterSpacing: '2px', padding: '0 4px', fontWeight: 700 }}>...</span>
                </li>
                {renderItem(last, items.length - 2, false)}
                {renderItem(current, items.length - 1, true)}
            </>
        );
    };

    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol className="breadcrumbs-list">
                <li className="breadcrumbs-item">
                    <Link to="/movements" className="breadcrumbs-link">
                        <span className="breadcrumbs-icon"><RiRunLine size={18} /></span>
                        <span>Movements</span>
                    </Link>
                </li>
                {renderItems()}
            </ol>
        </nav>
    );
};
