import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export const Input: React.FC<InputProps> = ({
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props
}) => {
  return (
    <input
      className={`input input--${variant} input--${size} ${className}`}
      {...props}
    />
  );
};
