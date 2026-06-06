import { type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** The visual style of the button */
    variant?: 'primary' | 'secondary' | 'danger' | 'text';
    /** Standard height or compressed 30px height */
    size?: 'default' | 'small';
    /** Forces a 1:1 aspect ratio, ideal for icon-only buttons */
    isSquare?: boolean;
    /** Shrinks the button width to strictly fit its content */
    isHug?: boolean;
    /** Removes standard horizontal padding */
    noPadding?: boolean;
    /** Enforces a minimum width and spaces content evenly */
    isGroupControl?: boolean;
}

export const Button = ({
                           variant = 'secondary',
                           size = 'default',
                           isSquare = false,
                           isHug = false,
                           noPadding = false,
                           isGroupControl = false,
                           className = '',
                           children,
                           ...props
                       }: ButtonProps): JSX.Element => {

    // Dynamically construct the class list based on props
    const classes = [
        'btn',
        variant !== 'text' ? `btn-${variant}` : '',
        size === 'small' ? 'btn-small' : '',
        isSquare ? 'btn-square' : '',
        isHug ? 'btn-hug' : '',
        noPadding ? 'btn-no-padding' : '',
        isGroupControl ? 'btn-group-control' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};