import { useParams, useNavigate } from 'react-router-dom';
import { RiArrowLeftLine } from "react-icons/ri";
import '../../../styles/base.css';

// Movement declarations
export type MovementType = 'underarm-throw' | 'one-legged-stand' | 'walking-exercise';

/**
 * fetches movement details based on the id
 */
const getMovementDetails = (id: string | undefined) => {
    switch (id) {
        case 'underarm-throw': return { title: 'Underarm Throw', subtitle: 'Practice your throwing skills.' };
        case 'one-legged-stand': return { title: 'One-Legged Stand', subtitle: 'Test your balance.' };
        case 'walking-exercise': return { title: 'Walking Exercise', subtitle: 'Analyze your gait.' };
        default: return { title: 'Unknown Movement', subtitle: 'Movement not found.' };
    }
};

export const LearnPage = () => {
    const { movementId } = useParams();
    const navigate = useNavigate();
    const info = getMovementDetails(movementId);

    return (
        <div style={{ padding: 'var(--space-6)', maxWidth: '800px' }}>
            {/* Back Button */}
            <button
                onClick={() => navigate('/movements')}
                style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    color: 'var(--colour-zinc-500)',
                    cursor: 'pointer',
                    marginBottom: 'var(--space-6)',
                    fontSize: 'var(--text-sm)'
                }}
            >
                <RiArrowLeftLine /> Back to Movements
            </button>

            {/* Content */}
            <h1 style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--colour-zinc-900)',
                marginBottom: 'var(--space-2)'
            }}>
                {info.title}
            </h1>
            <p style={{ color: 'var(--colour-zinc-500)', fontSize: 'var(--text-lg)' }}>
                {info.subtitle}
            </p>

            <div style={{
                marginTop: 'var(--space-8)',
                padding: 'var(--space-8)',
                border: '1px dashed var(--colour-zinc-300)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--colour-zinc-400)',
                textAlign: 'center'
            }}>
                Learning content for <strong>{movementId}</strong> goes here.
            </div>
        </div>
    );
};