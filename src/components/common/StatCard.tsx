import { ReactNode } from 'react';

export interface StatCardProps {
    title: string;
    icon: ReactNode;
    value: ReactNode;
    status: 'success' | 'error' | 'neutral';
    statusText: string;
    statusIcon?: ReactNode;
    detailText: string;
}

export const StatCard = ({
    title,
    icon,
    value,
    status,
    statusText,
    statusIcon,
    detailText
}: StatCardProps) => {
    return (
        <div className="report-card stat-card">
            <div className="stat-card__main shadow-1">
                <div className="stat-card__header">
                    <div className="stat-card__icon shadow-1">{icon}</div>
                    <div className="stat-card__title">{title}</div>
                </div>
                <div className="stat-card__value">
                    {value}
                </div>
            </div>
            <div className="stat-card__footer">
                <div className={`stat-card__status ${status}`}>
                    {statusIcon}
                    {statusText}
                </div>
                <div className="stat-card__detail">
                    {detailText}
                </div>
            </div>
        </div>
    );
};
