import { useEffect, type ReactNode } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import './Toast.css';

export interface ToastProps {
    title: string;
    message: string;
    icon?: ReactNode;
    action?: ReactNode;
    duration?: number;
    onClose: () => void;
}

export const Toast = ({
    title,
    message,
    icon,
    action,
    duration,
    onClose
}: ToastProps): JSX.Element => {
    useEffect(() => {
        if (duration !== undefined && duration > 0) {
            const timerId: NodeJS.Timeout = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timerId);
        }
    }, [duration, onClose]);

    return (
        <div className="toast-container shadow-9">
            <div className="toast-content">
                {icon && <div className="toast-icon">{icon}</div>}
                <div className="toast-main">
                    <div className="toast-header">
                        <h4 className="toast-title">{title}</h4>
                        <button className="toast-close" onClick={onClose} aria-label="Close notification">
                            <RiCloseLine size={20} />
                        </button>
                    </div>
                    <p className="toast-message">{message}</p>
                    {action && <div className="toast-action">{action}</div>}
                </div>
            </div>
            {duration !== undefined && duration > 0 && (
                <div 
                    className="toast-progress" 
                    style={{ animationDuration: `${duration}ms` }}
                />
            )}
        </div>
    );
};
