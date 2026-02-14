import { useNavigate } from 'react-router-dom';
import './style.css';
import { MovementCard } from '../../components/MovementCard';

export const MovementsPage = () => {
    const navigate = useNavigate();

    // Helper to handle navigation strictly with our Enum
    const handleCardClick = (id: string) => {
        navigate(`/movements/learn/${id}`);
    };

    return (
        <div className="movements-page">

            <header className="movements-hero">
                <h1 className="movements-hero__title">Welcome back, Dimitri!</h1>
                <p className="movements-hero__subtitle">Select a movement to start.</p>
            </header>

            <section className="movements-grid">
                <MovementCard
                    title="Underarm Throw"
                    description="Practice your throwing skills! Toss a ball underhand."
                    imageUrl=""
                    onClick={() => handleCardClick('underarm-throw')}
                />
                <MovementCard
                    title="One-Legged Stand"
                    description="Test your balance! Stand on one leg and see how long you can stay steady."
                    imageUrl=""
                    onClick={() => handleCardClick('one-legged-stand')}
                />
                <MovementCard
                    title="Walking Exercise"
                    description="Let's see how you walk! Walk across the room in a straight line."
                    imageUrl=""
                    onClick={() => handleCardClick('walking-exercise')}
                />
            </section>

        </div>
    );
};