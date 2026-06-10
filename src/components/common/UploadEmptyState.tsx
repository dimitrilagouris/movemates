import { RiUploadCloud2Line } from 'react-icons/ri';
import { Button } from './Button';
import './UploadEmptyState.css';

export interface UploadEmptyStateProps {
    /** The main title of the empty state */
    title: string;
    /** The descriptive text */
    description: string;
    /** The text for the primary button */
    buttonText: string;
    /** Whether an upload or save operation is currently in progress */
    isLoading?: boolean;
    /** The title to display when isLoading is true */
    loadingTitle?: string;
    /** The button text to display when isLoading is true */
    loadingButtonText?: string;
    /** Callback fired when the entire area or button is clicked */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
}

export const UploadEmptyState = ({
    title,
    description,
    buttonText,
    isLoading = false,
    loadingTitle = "Saving...",
    loadingButtonText = "Saving...",
    onClick,
    className = ""
}: UploadEmptyStateProps) => {
    return (
        <div className={`upload-empty-state ${className}`} onClick={onClick}>
            <div className="empty-state-content">
                <div className="empty-state-icon">
                    <RiUploadCloud2Line size={48} className={isLoading ? "animate-pulse" : ""} />
                </div>
                <h3>{isLoading ? loadingTitle : title}</h3>
                <p>{description}</p>
                <Button variant="primary" className="shadow-1" disabled={isLoading}>
                    {isLoading ? loadingButtonText : buttonText}
                </Button>
            </div>
        </div>
    );
};
