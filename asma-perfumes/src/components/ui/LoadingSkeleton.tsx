import React from 'react';

export const CollectionSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden bg-noir-card shimmer shimmer-anim h-64" />
      ))}
    </div>
  );
};

export default CollectionSkeleton;
