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
        <div className="goal-card">
            <div className="goal-card__main shadow-1">
                <div className="goal-card__content">
                    <button 
                        className={`goal-card__checkbox ${goal.completed ? 'goal-card__checkbox--completed' : ''}`}
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
                            className={`goal-card__tick ${goal.completed ? 'goal-card__tick--completed' : ''}`}
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </button>
                    
                    <div className="goal-card__text-container">
                        <div className="goal-card__text-wrapper">
                            <span className="goal-card__hidden-span">
                                {goal.text || ' '}
                            </span>
                            
                            <input
                                type="text"
                                placeholder="Enter your goal..."
                                value={goal.text}
                                onChange={handleTextChange}
                                className={`goal-card__input ${goal.completed ? 'goal-card__input--completed' : ''}`}
                            />
                            
                            <div className={`goal-card__strikethrough ${goal.completed ? 'goal-card__strikethrough--completed' : ''}`} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="goal-card__date">
                Added: {goal.text.trim() !== '' ? (goal.dateAdded || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })) : 'N/A'}
            </div>
        </div>
    );
};
