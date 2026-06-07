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
                            padding: 0
                        }}
                        onClick={() => onChange({ ...goal, completed: !goal.completed })}
                    >
                        {goal.completed && <RiCheckLine size={16} />}
                    </button>
                    
                    <div style={{ flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Enter your goal..."
                            value={goal.text}
                            onChange={handleTextChange}
                            style={{
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: goal.completed ? 'oklch(0.5 0 0)' : 'oklch(0.2 0 0)',
                                textDecoration: goal.completed ? 'line-through' : 'none',
                            }}
                        />
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
