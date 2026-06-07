import React, { useState } from 'react';
import './TextInput.css';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    multiline?: boolean;
    icon?: React.ReactNode;
    resizable?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ 
    multiline = false, 
    icon, 
    resizable = false,
    className = '',
    ...props 
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const baseClass = `text-input-wrapper ${isFocused ? 'text-input-wrapper--focused' : ''} ${className}`;
    
    return (
        <div className={baseClass}>
            {icon && <span className="text-input-icon">{icon}</span>}
            {multiline ? (
                <textarea 
                    className={`text-input-field ${resizable ? 'text-input-field--resizable' : ''}`}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e as any);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e as any);
                    }}
                    {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                />
            ) : (
                <input 
                    className="text-input-field"
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e as any);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e as any);
                    }}
                    {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                />
            )}
        </div>
    );
};
