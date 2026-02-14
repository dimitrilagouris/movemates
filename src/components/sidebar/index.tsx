import { useState } from 'react';
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

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activePage, setActivePage] = useState('Dashboard');

    const toggleCollapse = () => setCollapsed((prev) => !prev);
    const handleNav = (page: string) => setActivePage(page);

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
            {/* Header */}
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

            {/* Main Navigation */}
            <nav className="sidebar__nav">
                <SidebarItem
                    label="Movement"
                    icon={<RiRunLine size={20} />}
                    isActive={activePage === 'Movement'}
                    onClick={() => handleNav('Movement')}
                />
                <SidebarItem
                    label="Progress"
                    icon={<RiHeartPulseLine size={20} />}
                    isActive={activePage === 'Progress'}
                    onClick={() => handleNav('Progress')}
                />
                <SidebarItem
                    label="Help"
                    icon={<RiQuestionLine size={20} />}
                    isActive={activePage === 'Help'}
                    onClick={() => handleNav('Help')}
                />
            </nav>

            {/* Footer Navigation */}
            <div className="sidebar__footer-nav">
                <SidebarItem
                    label="Settings"
                    icon={<RiSettings3Line size={20} />}
                    isActive={activePage === 'Settings'}
                    onClick={() => handleNav('Settings')}
                />

                <UserProfile
                    name="Dimitri Lagouris"
                    avatarUrl=""
                />
            </div>
        </aside>
    );
};