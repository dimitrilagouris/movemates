import React from 'react';
import type { ProgressGoal } from '../../types/progress';
import { RiCheckLine } from 'react-icons/ri';

interface GoalCardProps {
    goal: ProgressGoal;
    onChange: (updatedGoal: ProgressGoal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onChange }) => {
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newText = e.target.value;
        const isNewlyAdded = goal.text.trim() === '' && newText.trim() !== '';
        
        const updatedGoal = {
            ...goal,
            text: newText
        };

        if (isNewlyAdded) {
            updatedGoal.dateAdded = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        onChange(updatedGoal);
    };

    return (
        <div className="goal-card" style={{ paddingBottom: '8px' }}>
            <div className="goal-card__main shadow-1" style={{ display: 'flex', alignItems: 'flex-start', padding: '16px', width: '100%' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', width: '100%' }}>
                    <button 
                        style={{ 
                            marginTop: '2px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '6px',
                            border: goal.completed ? 'none' : '2px solid oklch(0.85 0 0)',
                            backgroundColor: goal.completed ? 'var(--colour-lime-500)' : '#fff',
                            color: '#fff',
                            cursor: 'pointer',
                            flexShrink: 0,
                            padding: 0,
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => onChange({ ...goal, completed: !goal.completed })}
                    >
                        <svg 
                            width="14" height="14" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            style={{
                                strokeDasharray: 24,
                                strokeDashoffset: goal.completed ? 0 : 24,
                                transition: 'stroke-dashoffset 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.1s',
                                opacity: goal.completed ? 1 : 0
                            }}
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </button>
                    
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                        {/* 
                          We use a relative inline-block wrapper here that dynamically 
                          sizes itself to the text (via the hidden span).
                          This allows the absolute strike-line to only be as wide as the text!
                        */}
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <span style={{
                                visibility: 'hidden',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                whiteSpace: 'pre',
                                pointerEvents: 'none',
                                display: 'inline-block'
                            }}>
                                {goal.text || ' '}
                            </span>
                            
                            <input
                                type="text"
                                placeholder="Enter your goal..."
                                value={goal.text}
                                onChange={handleTextChange}
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    height: '100%',
                                    width: '100%',
                                    minWidth: '200px', /* Allow typing beyond the span width */
                                    border: 'none',
                                    outline: 'none',
                                    background: 'transparent',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    color: goal.completed ? 'oklch(0.5 0 0)' : 'oklch(0.2 0 0)',
                                    transition: 'color 0.3s ease'
                                }}
                            />
                            
                            {/* The animated strikethrough line */}
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                height: '2px',
                                backgroundColor: 'oklch(0.5 0 0)',
                                transform: 'translateY(-50%)',
                                width: goal.completed ? '100%' : '0%',
                                transition: 'width 0.4s cubic-bezier(0.65, 0, 0.45, 1)',
                                pointerEvents: 'none',
                                opacity: goal.completed ? 1 : 0
                            }} />
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ 
                alignSelf: 'flex-end', 
                fontSize: '10px', 
                fontFamily: 'var(--font-mono, monospace)', 
                color: 'oklch(0.5 0 0)', 
                paddingTop: '6px',
                paddingRight: '12px'
            }}>
                Added: {goal.text.trim() !== '' ? (goal.dateAdded || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })) : 'N/A'}
            </div>
        </div>
    );
};
