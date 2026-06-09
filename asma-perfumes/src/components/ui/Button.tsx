import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'ghost' | 'solid' };

const Button: React.FC<Props> = ({ children, variant = 'ghost', className = '', ...rest }) => {
  const base = 'inline-flex items-center justify-center font-body rounded-md';
  const styles =
    variant === 'solid'
      ? 'bg-primary text-primary-foreground px-4 py-2 text-sm tracking-wide'
      : 'border border-border text-primary px-3 py-1.5 text-xs tracking-[0.2em] uppercase';

  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
