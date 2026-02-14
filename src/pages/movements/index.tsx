import './style.css';
import { MovementCard } from '../../components/MovementCard';

export const MovementsPage = () => {
    return (
        <div className="movements-page">

            {/* 1. Welcome Hero */}
            <header className="movements-hero">
                <h1 className="movements-hero__title">Welcome back, Dimitri!</h1>
                <p className="movements-hero__subtitle">Select a movement to start.</p>
            </header>

            {/* 2. Top Cards Section */}
            <section className="movements-grid">
                <MovementCard
                    title="Underarm Throw"
                    description="Practice your throwing skills! Toss a ball underhand."
                    imageUrl=""
                />
                <MovementCard
                    title="One-Legged Stand"
                    description="Test your balance! Stand on one leg and see how long you can stay steady."
                    imageUrl=""
                />
                <MovementCard
                    title="Walking Exercise"
                    description="Let's see how you walk! Walk across the room in a straight line."
                    imageUrl=""
                />
            </section>

        </div>
    );
};