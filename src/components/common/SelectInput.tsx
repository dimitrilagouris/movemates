import React, { useState } from 'react';
import './SelectInput.css';

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: SelectOption[];
    icon?: React.ReactNode;
}

export const SelectInput: React.FC<SelectInputProps> = ({ 
    options,
    icon,
    className = '',
    ...props 
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const baseClass = `select-input-wrapper ${isFocused ? 'select-input-wrapper--focused' : ''} ${className}`;
    
    return (
        <div className={baseClass}>
            {icon && <span className="select-input-icon">{icon}</span>}
            <select 
                className="select-input-field"
                onFocus={(e) => {
                    setIsFocused(true);
                    props.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    props.onBlur?.(e);
                }}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
