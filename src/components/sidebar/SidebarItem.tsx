import type {ReactNode} from 'react';

interface SidebarItemProps {
    label: string;
    icon: ReactNode;
    isActive?: boolean;
    onClick?: () => void;
}

export const SidebarItem = ({ label, icon, isActive, onClick }: SidebarItemProps) => {
    return (
        <div
            className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
            onClick={onClick}
        >
            <div className="sidebar-item__icon">
                {icon}
            </div>
            <span className="sidebar-item__label">{label}</span>
        </div>
    );
};