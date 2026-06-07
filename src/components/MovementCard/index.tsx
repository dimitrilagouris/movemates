import './style.css';

interface MovementCardProps {
    title: string;
    description: string;
    imageUrl: string; // Now accepts a direct image source
    onClick?: () => void;
}

export const MovementCard = ({ title, description, imageUrl, onClick }: MovementCardProps) => {
    return (
        <div
            className="movement-card shadow-3"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
        >
            <div className="movement-card__image-wrapper">
                <img
                    src={imageUrl}
                    alt=""
                    className="movement-card__image"
                    loading="lazy"
                />
            </div>

            <div className="movement-card__content">
                <h3 className="movement-card__title">{title}</h3>
                <p className="movement-card__description">{description}</p>
            </div>
        </div>
    );
};