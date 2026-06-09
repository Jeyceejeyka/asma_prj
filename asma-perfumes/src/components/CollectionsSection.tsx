import { useMemo, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useProductsStore } from '@/store/productsStore';
import { useCatalog } from '@/hooks/useCatalog';
import { resolveCollectionImage } from '@/lib/assets';
import type { Product } from '@/types/product';

import Container from '@/components/ui/Container';
import { Eyebrow, Display, Lead } from '@/components/ui/Typography';
import CollectionCard from '@/components/collections/CollectionCard';
import CollectionSkeleton from '@/components/ui/LoadingSkeleton';
import { EmptyState, ErrorState } from '@/components/ui/EmptyError';

const CollectionsSection = () => {
  const { collections, error, loading } = useCatalog();
  const products = useProductsStore((s) => s.products);
  const [showAll, setShowAll] = useState(false);
  const visibleCollections = showAll ? collections : collections.slice(0, 8);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1.05, 1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);

  const collectionMeta = useMemo(() => {
    const map = new Map<string, { coverImage: string; productCount: number }>();

    products.forEach((product: Product) => {
      const collectionName = product.collection;
      const current = map.get(collectionName);
      if (current) {
        map.set(collectionName, {
          productCount: current.productCount + 1,
          coverImage: current.coverImage || product.image,
        });
      } else {
        map.set(collectionName, {
          productCount: 1,
          coverImage: product.image,
        });
      }
    });

    return map;
  }, [products]);

  if (error) return <ErrorState />;
  if (loading) return <CollectionSkeleton />;
  if (!collections || collections.length === 0) return <EmptyState />;

  const featuredCollection = collections[0];
  const spotlightCollections = collections.slice(1, 3);

  return (
    <section id="collections" ref={sectionRef} className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/[0.02] rounded-full blur-[150px] pointer-events-none" />

      <Container>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="text-center mb-12 sm:mb-20"
        >
          <Eyebrow className="mb-5">Curated for You</Eyebrow>
          <Display>Signature Collections</Display>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-28 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto mt-6 sm:mt-8"
          />
          <Lead className="max-w-2xl mx-auto mt-6 text-slate-400/80">
            Discover our most celebrated scent families in a gallery of refined fragrances, where every collection is designed to make a lasting impression.
          </Lead>
        </motion.div>

        {/* Featured Collection Hero */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="relative mb-12 sm:mb-16"
        >
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] items-stretch">
            {/* Main Featured Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="group relative rounded-[28px] bg-noir-card border border-border/60 overflow-hidden min-h-[400px] sm:min-h-[500px]"
            >
              {/* Collection Image */}
              <div className="absolute inset-0">
                <img
                  src={collectionMeta.get(featuredCollection.name)?.coverImage || featuredCollection.image || resolveCollectionImage(featuredCollection.name)}
                  alt={featuredCollection.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background/90" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 left-4 w-12 h-12 border-l border-t border-primary/20 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-r border-b border-primary/20 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <p className="text-[10px] sm:text-[11px] tracking-[0.4em] uppercase text-primary/80 mb-4 font-body">Featured Collection</p>
                  <h3 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground mb-4">{featuredCollection.name}</h3>
                  <p className="mt-3 text-foreground/50 font-light text-sm sm:text-base leading-relaxed max-w-lg">{featuredCollection.description || featuredCollection.tagline || 'A sensorial journey anchored in premium extracts and timeless craftsmanship.'}</p>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                        {collectionMeta.get(featuredCollection.name)?.productCount ?? 0} fragrances
                      </span>
                      <span className="w-1 h-1 rounded-full bg-primary/40" />
                      <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Exclusive</span>
                    </div>
                  </div>
                  <Link
                    to={`/collections/${encodeURIComponent(featuredCollection.name)}`}
                    className="group/btn inline-flex items-center gap-2 mt-6 rounded-full border border-primary bg-primary/10 px-6 py-3 text-sm tracking-[0.2em] uppercase text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                  >
                    View Collection
                    <ArrowUpRight size={16} className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </Link>
                </motion.div>
              </div>

              {/* Gold Border Glow on Hover */}
              <div className="absolute inset-0 rounded-[28px] border border-primary/0 group-hover:border-primary/30 transition-colors duration-500 pointer-events-none" />
              <div className="absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none gold-glow" />
            </motion.div>

            {/* Spotlight Collections */}
            <div className="grid gap-6">
              {spotlightCollections.map((collection, index) => {
                const meta = collectionMeta.get(collection.name);
                const coverImage = meta?.coverImage || collection.image || resolveCollectionImage(collection.name);
                const productCount = meta?.productCount ?? 0;
                return (
                  <motion.div
                    key={collection.name}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.75, delay: index * 0.15 }}
                  >
                    <CollectionCard
                      collection={collection}
                      coverImage={coverImage}
                      productCount={productCount}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Collection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {visibleCollections.map((collection, index) => {
            const meta = collectionMeta.get(collection.name);
            const coverImage = meta?.coverImage || collection.image || resolveCollectionImage(collection.name);
            const productCount = meta?.productCount ?? 0;
            return (
              <motion.div
                key={collection.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.08 }}
              >
                <CollectionCard collection={collection} coverImage={coverImage} productCount={productCount} />
              </motion.div>
            );
          })}
        </div>

        {collections.length > 8 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 flex justify-center"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="group relative text-[11px] uppercase tracking-[0.25em] text-primary/80 transition-colors duration-300 hover:text-primary"
            >
              <span className="relative z-10 flex items-center gap-2">
                {showAll ? 'Show Less' : `View All ${collections.length} Collections`}
                <motion.span
                  animate={{ rotate: showAll ? -180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowUpRight size={14} className={showAll ? 'rotate-[-180deg]' : ''} />
                </motion.span>
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary/40 group-hover:w-full transition-all duration-500" />
            </button>
          </motion.div>
        )}
      </Container>
    </section>
  );
};

export default CollectionsSection;
