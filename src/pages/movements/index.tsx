import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import { MovementCard } from '../../components/MovementCard';
import { MOVEMENTS } from '../../config/movements';
import { type MovementId } from '../../types/movements';
import { DatabaseEngine } from '../../engine/db/DatabaseEngine';

/**
 * Renders the main dashboard grid for movement selection.
 */
export const MovementsPage = (): JSX.Element => {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState<string>('');
    const dbRef = useRef(new DatabaseEngine());

    useEffect(() => {
        const loadProfile = async (): Promise<void> => {
            const settings = await dbRef.current.loadSettings();
            if (settings?.userName) {
                // Extract just the first name for a friendlier dashboard greeting
                setFirstName(settings.userName.split(' ')[0]);
            }
        };
        loadProfile();
    }, []);

    const handleCardClick = (id: MovementId): void => {
        navigate(`/movements/learn/${id}`);
    };

    return (
        <div className="movements-page">
            <header className="movements-hero">
                <h1 className="movements-hero__title">
                    Welcome back{firstName ? `, ${firstName}` : ''}!
                </h1>
                <p className="movements-hero__subtitle">Select a movement to start.</p>
            </header>

            <section className="movements-grid">
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

            <div className="movements-disclaimer">
                Movemates is an AI screening tool, not a substitute for professional medical advice. Always consult your physiotherapist for diagnoses.
            </div>
        </div>
    );
};