import './style.css';

interface ArmSelectorProps {
    activeArm: 'Left' | 'Right';
    onChange: (arm: 'Left' | 'Right') => void;
}

/**
 * Minimal stick figure in a T-pose. Users click an arm to select it.
 */
export const ArmSelector = ({ activeArm, onChange }: ArmSelectorProps) => {
    const leftActive = activeArm === 'Left';
    const rightActive = activeArm === 'Right';

    return (
        <div className="arm-selector">
            <svg
                viewBox="0 0 200 240"
                className="arm-selector__svg"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Head */}
                <circle cx="100" cy="32" r="18" className="body-part body-stroke" strokeWidth="5" />

                {/* Spine */}
                <line x1="100" y1="50" x2="100" y2="140" className="body-part body-stroke" strokeWidth="5" strokeLinecap="round" />

                {/* Left leg (viewer's right) */}
                <line x1="100" y1="140" x2="125" y2="210" className="body-part body-stroke" strokeWidth="5" strokeLinecap="round" />
                {/* Right leg (viewer's left) */}
                <line x1="100" y1="140" x2="75" y2="210" className="body-part body-stroke" strokeWidth="5" strokeLinecap="round" />

                {/* ===== Right arm (figure's right, viewer's left) ===== */}
                <g
                    className={`arm-group ${rightActive ? 'arm-group--active' : ''}`}
                    onClick={() => onChange('Right')}
                >
                    <rect x="10" y="55" width="55" height="30" className="arm-hit-area" rx="4" />
                    <line x1="100" y1="70" x2="20" y2="70" className="arm-part" strokeWidth="5" strokeLinecap="round" />
                    <circle cx="20" cy="70" r="5" className="arm-part arm-fill" />
                    <text x="55" y="100" className="arm-selector__label">Right</text>
                </g>

                {/* ===== Left arm (figure's left, viewer's right) ===== */}
                <g
                    className={`arm-group ${leftActive ? 'arm-group--active' : ''}`}
                    onClick={() => onChange('Left')}
                >
                    <rect x="135" y="55" width="55" height="30" className="arm-hit-area" rx="4" />
                    <line x1="100" y1="70" x2="180" y2="70" className="arm-part" strokeWidth="5" strokeLinecap="round" />
                    <circle cx="180" cy="70" r="5" className="arm-part arm-fill" />
                    <text x="145" y="100" className="arm-selector__label">Left</text>
                </g>
            </svg>

            <div className="arm-selector__footer">
                <span className="arm-selector__active-label">
                    {activeArm} Arm
                </span>
            </div>
        </div>
    );
};
