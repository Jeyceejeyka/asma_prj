import React from 'react';

export const EmptyState: React.FC<{ title?: string; description?: string }> = ({
  title = 'No collections yet',
  description = 'We are curating something special. Check back soon or explore products.'
}) => (
  <div className="w-full text-center py-16">
    <p className="text-muted-foreground mb-4">{title}</p>
    <p className="text-foreground/80 max-w-xl mx-auto">{description}</p>
  </div>
);

export const ErrorState: React.FC<{ title?: string; description?: string }> = ({
  title = 'Unable to load collections',
  description = 'There was an error fetching collections. Try refreshing the page.'
}) => (
  <div className="w-full text-center py-16">
    <p className="text-destructive mb-4">{title}</p>
    <p className="text-muted-foreground max-w-xl mx-auto">{description}</p>
  </div>
);

export default EmptyState;
