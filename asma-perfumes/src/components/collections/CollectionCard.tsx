import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { ArrowRight } from 'lucide-react';

type Collection = {
  name: string;
  tagline?: string;
  description?: string;
  image?: string;
};

const CollectionCard: React.FC<{
  collection: Collection;
  coverImage: string;
  productCount: number;
  variant?: 'hero' | 'standard';
}> = ({ collection, coverImage, productCount, variant = 'standard' }) => {
  const isHero = variant === 'hero';
  const [imageSrc, setImageSrc] = useState(coverImage);

  return (
    <Link
      to={`/collections/${encodeURIComponent(collection.name)}`}
      aria-label={`Open collection ${collection.name}`}
      className={`group block transition-transform duration-300 ${isHero ? 'h-full' : ''}`}
    >
      <Card className={`card-elevate ${isHero ? 'overflow-hidden' : ''}`}>
        <div className={`relative overflow-hidden ${isHero ? 'aspect-[4/5]' : 'aspect-[3/4]'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/40 pointer-events-none" />
          <img
            src={imageSrc}
            alt={collection.name}
            onError={() => setImageSrc('/placeholder.svg')}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute top-5 left-5 rounded-full bg-background/80 border border-border/40 px-3 py-1 backdrop-blur-sm">
            <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{productCount} scents</span>
          </div>

          <div className={`absolute inset-x-6 ${isHero ? 'bottom-8' : 'bottom-6'}`}>
            <h3 className={`font-display ${isHero ? 'text-3xl sm:text-4xl' : 'text-lg sm:text-xl'} text-foreground leading-tight`}>
              {collection.name}
            </h3>
            {collection.tagline ? (
              <p className={`mt-3 ${isHero ? 'text-base' : 'text-sm'} text-muted-foreground italic max-w-[90%]`}>
                {collection.tagline}
              </p>
            ) : collection.description ? (
              <p className={`mt-3 ${isHero ? 'text-base' : 'text-sm'} text-muted-foreground italic max-w-[90%]`}>
                {collection.description}
              </p>
            ) : null}
          </div>

          <div className={`absolute ${isHero ? 'bottom-6 right-6' : 'bottom-4 right-4'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
            <span className="inline-flex items-center gap-2 text-primary tracking-[0.15em] uppercase text-sm">
              Explore
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default CollectionCard;
