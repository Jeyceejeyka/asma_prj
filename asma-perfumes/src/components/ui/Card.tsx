import React from 'react';

type Props = React.PropsWithChildren<{
  className?: string;
  as?: string;
}>;

const Card: React.FC<Props> = ({ children, className = '', as: As = 'div' }) => {
  return (
    // eslint-disable-next-line react/jsx-no-undef
    <As className={`rounded-[14px] overflow-hidden bg-noir-card border border-border ${className}`}>
      {children}
    </As>
  );
};

export default Card;
