import { type ChangeEvent } from 'react';
import './scrubber-bar.css';

export interface ScrubberBarProps {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange?: (value: number) => void;
}

export const ScrubberBar = ({
                                value,
                                min = 0,
                                max = 100,
                                step = 1,
                                onChange
                            }: ScrubberBarProps) => {
    const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(Number(e.target.value));
        }
    };

    return (
        <div className="scrubber-container">
            <div className="scrubber-track-dashed" />

            {/* The calc expression stops the track short to create the gap */}
            <div
                className="scrubber-track-filled"
                style={{ width: `calc(${percent}% - 6px)` }}
            />

            <div className="scrubber-thumb" style={{ left: `${percent}%` }} />

            <input
                type="range"
                className="scrubber-input"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                aria-label="Progress scrubber"
            />
        </div>
    );
};