import { useParams, useNavigate } from 'react-router-dom';
import { RiArrowLeftLine } from "react-icons/ri";
import { MOVEMENTS } from '../../../config/movements';
import type {MovementId} from '../../../types/movements';


import '../../../styles/base.css';

export const LearnPage = () => {

    const { movementId } = useParams<{ movementId: MovementId }>();
    const navigate = useNavigate();

    // Look up movement data
    const movement = movementId ? MOVEMENTS[movementId] : null;

    if (!movement) {
        return <div>Movement not found</div>;
    }

    return (
        <div style={{ padding: 'var(--space-6)', maxWidth: '800px' }}>
            <button
                onClick={() => navigate('/movements')}
                style={{
                    background: 'none', border: 'none', display: 'flex', alignItems: 'center',
                    gap: 'var(--space-2)', color: 'var(--colour-zinc-500)', cursor: 'pointer', marginBottom: 'var(--space-6)'
                }}
            >
                <RiArrowLeftLine /> Back to Movements
            </button>

            <h1>{movement.title}</h1>
            <p>{movement.subtitle}</p>
        </div>
    );
};