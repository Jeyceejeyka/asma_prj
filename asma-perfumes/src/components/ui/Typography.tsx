import React from 'react';

export const Display: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight ${className}`}>{children}</h2>
);

export const Eyebrow: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <p className={`text-[10px] tracking-[0.35em] uppercase text-primary/70 ${className}`}>{children}</p>
);

export const Lead: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <p className={`text-muted-foreground text-sm sm:text-base ${className}`}>{children}</p>
);

export default Display;
