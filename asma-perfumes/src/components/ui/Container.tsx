import React from 'react';

type Props = React.PropsWithChildren<{
  className?: string;
}>;

const Container: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <div className={`max-w-screen-xl mx-auto section-padding ${className}`}>{children}</div>
  );
};

export default Container;
