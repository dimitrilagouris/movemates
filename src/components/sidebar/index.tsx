import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    RiSidebarFoldLine,
    RiSidebarUnfoldLine,
    RiRunLine,
    RiHeartPulseLine,
    RiQuestionLine,
    RiSettings3Line
} from "react-icons/ri";

import './style.css';
import { SidebarItem } from './SidebarItem';
import { UserProfile } from './UserProfile';

export const Sidebar = (): JSX.Element => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleCollapse = (): void => setCollapsed((prev) => !prev);

    const isRouteActive = (path: string): boolean => location.pathname.startsWith(path);

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
            <div className="sidebar__header">
                <div className="sidebar__logo-container">
                    <span className="sidebar__logo-text">MoveMates</span>
                </div>

                <button
                    className="sidebar__toggle"
                    onClick={toggleCollapse}
                    aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {collapsed ? <RiSidebarUnfoldLine size={20} /> : <RiSidebarFoldLine size={20} />}
                </button>
            </div>

            <nav className="sidebar__nav">
                <SidebarItem
                    label="Movement"
                    icon={<RiRunLine size={20} />}
                    isActive={isRouteActive('/movements')}
                    onClick={() => navigate('/movements')}
                />
                <SidebarItem
                    label="Progress"
                    icon={<RiHeartPulseLine size={20} />}
                    isActive={isRouteActive('/progress')}
                    onClick={() => navigate('/progress')}
                />
                <SidebarItem
                    label="Help"
                    icon={<RiQuestionLine size={20} />}
                    isActive={isRouteActive('/help')}
                    onClick={() => navigate('/help')}
                />
            </nav>

            <div className="sidebar__footer-nav">
                <SidebarItem
                    label="Settings"
                    icon={<RiSettings3Line size={20} />}
                    isActive={isRouteActive('/settings')}
                    onClick={() => navigate('/settings')}
                />

                <UserProfile
                    name="Account"
                    avatarUrl=""
                />
            </div>
        </aside>
    );
};