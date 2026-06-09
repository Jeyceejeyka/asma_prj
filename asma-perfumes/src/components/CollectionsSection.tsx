import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
    <section id="collections" className="py-16 sm:py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-10 sm:mb-16"
        >
          <Eyebrow className="mb-4">Curated for You</Eyebrow>
          <Display>Signature Collections</Display>
          <div className="w-28 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6 sm:mt-8" />
          <Lead className="max-w-2xl mx-auto mt-6 text-slate-400">
            Discover our most celebrated scent families in a gallery of refined fragrances, where every collection is designed to make a lasting impression.
          </Lead>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.85fr] items-start mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="rounded-[24px] bg-noir-card border border-border p-8 md:p-10 lg:p-12"
          >
            <p className="text-[11px] tracking-[0.4em] uppercase text-primary/70 mb-4">Featured Collection</p>
            <h3 className="font-display text-4xl md:text-5xl leading-tight text-foreground max-w-2xl">{featuredCollection.name}</h3>
            <p className="mt-6 text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">{featuredCollection.description || featuredCollection.tagline || 'A sensorial journey anchored in premium extracts and timeless craftsmanship.'}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-1">Stories inside</p>
                <p className="text-foreground text-sm">{collectionMeta.get(featuredCollection.name)?.productCount ?? 0} fragrances · Crafted for elevated moments</p>
              </div>
              <Link
                to={`/collections/${encodeURIComponent(featuredCollection.name)}`}
                className="inline-flex items-center justify-center rounded-full border border-primary bg-primary/10 px-6 py-3 text-sm tracking-[0.2em] uppercase text-primary transition hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                View Collection
              </Link>
            </div>
          </motion.div>

          <div className="grid gap-6">
            {spotlightCollections.map((collection, index) => {
              const meta = collectionMeta.get(collection.name);
              const coverImage = meta?.coverImage || collection.image || resolveCollectionImage(collection.name);
              const productCount = meta?.productCount ?? 0;
              return (
                <motion.div
                  key={collection.name}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, delay: index * 0.1 }}
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {visibleCollections.map((collection, index) => {
            const meta = collectionMeta.get(collection.name);
            const coverImage = meta?.coverImage || collection.image || resolveCollectionImage(collection.name);
            const productCount = meta?.productCount ?? 0;
            return (
              <motion.div key={collection.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: index * 0.08 }}>
                <CollectionCard collection={collection} coverImage={coverImage} productCount={productCount} />
              </motion.div>
            );
          })}
        </div>

        {collections.length > 8 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-[12px] uppercase tracking-[0.25em] text-primary/80 transition hover:text-primary"
            >
              {showAll ? 'Show less' : `Show ${collections.length - visibleCollections.length} more`}
            </button>
          </div>
        )}
      </Container>
    </section>
  );
};

export default CollectionsSection;
