import { useNavigate } from 'react-router-dom';
import './style.css';
import { MovementCard } from '../../components/MovementCard';
import { MOVEMENTS } from '../../config/movements';
import type {MovementId} from '../../types/movements';

export const MovementsPage = () => {
    const navigate = useNavigate();

    /**
     * Navigate to the learn page for the selected movement
     */
    const handleCardClick = (id: MovementId) => {
        navigate(`/movements/learn/${id}`);
    };

    return (
        <div className="movements-page">
            <header className="movements-hero">
                <h1 className="movements-hero__title">Welcome back, Dimitri!</h1>
                <p className="movements-hero__subtitle">Select a movement to start.</p>
            </header>

            <section className="movements-grid">
                {/* Map over the data object values */}
                {Object.values(MOVEMENTS).map((movement) => (
                    <MovementCard
                        key={movement.id}
                        title={movement.title}
                        description={movement.description}
                        imageUrl={movement.imageUrl}
                        onClick={() => handleCardClick(movement.id)}
                    />
                ))}
            </section>
        </div>
    );
};