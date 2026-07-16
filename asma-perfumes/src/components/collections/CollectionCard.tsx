import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import { resolveCollectionImage } from '@/lib/assets';

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
      className={`group block ${isHero ? 'h-full' : ''}`}
    >
      <Card className={`relative overflow-hidden ${isHero ? 'aspect-[4/5]' : 'aspect-[3/4]'} transition-all duration-500 hover:border-primary/30`}>
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-black/50 pointer-events-none z-[1]" />

        {/* Image */}
        <img
          src={imageSrc}
          alt={collection.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          onError={() => {
            const fallback = resolveCollectionImage(collection.name) || '/placeholder.svg';
            setImageSrc(fallback);
          }}
        />

        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-background/50 via-background/20 to-transparent z-[2] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />

        {/* Top Gold Line Animation */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent z-[3] w-0 group-hover:w-1/2 transition-all duration-500"
        />

        {/* Product Count Badge */}
        <div className="absolute top-4 left-4 z-[4]">
          <span className="text-[9px] tracking-[0.25em] uppercase bg-background/70 backdrop-blur-md text-muted-foreground px-3 py-1.5 rounded-full font-body border border-border/20">
            {productCount} scents
          </span>
        </div>

        {/* Content */}
        <div className={`absolute inset-x-5 z-[3] ${isHero ? 'bottom-8' : 'bottom-5'}`}>
          <h3 className={`font-display ${isHero ? 'text-3xl sm:text-4xl' : 'text-base sm:text-lg'} text-foreground leading-tight group-hover:text-primary transition-colors duration-300`}>
            {collection.name}
          </h3>
          {(collection.tagline || collection.description) && (
            <p className={`mt-2 ${isHero ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'} text-foreground/50 italic max-w-[90%] group-hover:text-foreground/60 transition-colors duration-300`}>
              {collection.tagline || collection.description}
            </p>
          )}
        </div>

        {/* Explore Arrow */}
        <motion.div
          className={`absolute z-[4] ${isHero ? 'bottom-6 right-6' : 'bottom-4 right-4'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        >
          <span className="inline-flex items-center gap-2 text-primary text-xs tracking-[0.15em] uppercase font-body">
            <span>Explore</span>
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </motion.div>

        {/* Corner Decorations */}
        <div className="absolute top-3 left-3 w-3 h-3 border-l border-t border-primary/0 group-hover:border-primary/30 transition-all duration-300 rounded-tl-sm z-[3]" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-r border-b border-primary/0 group-hover:border-primary/30 transition-all duration-300 rounded-br-sm z-[3]" />
      </Card>
    </Link>
  );
};

export default CollectionCard;
