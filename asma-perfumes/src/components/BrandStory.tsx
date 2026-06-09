import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import brandImage from "@/assets/brand-story.jpg";
import storiesData from "@/data/brand-stories.json";
import type { BrandStoryItem } from "@/types/brand";

const stories: BrandStoryItem[] = storiesData;

const BrandStory = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="py-16 sm:py-28 section-padding overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <motion.div style={{ y: imageY }}>
            <img
              src={brandImage}
              alt="Asma Perfumes Craftsmanship"
              className="w-full h-[350px] sm:h-[450px] lg:h-[650px] object-cover rounded-xl"
            />
          </motion.div>
          <div className="absolute inset-0 border border-primary/10 rounded-xl" />
          <div className="absolute -bottom-4 -right-4 w-full h-full border border-primary/10 rounded-xl hidden lg:block" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-8 sm:space-y-10"
        >
          <div>
            <p className="text-primary/60 text-[10px] tracking-[0.4em] uppercase mb-4 font-body">Our Heritage</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-5xl tracking-wide text-foreground leading-tight">
              The Art of
              <br />
              <span className="italic text-primary">Fragrance</span>
            </h2>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {stories.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <h4 className="text-primary text-xs tracking-[0.25em] uppercase mb-3 font-body font-light">
                  {item.label}
                </h4>
                <p className="text-foreground/50 font-light leading-[1.8] text-sm">
                  {item.text}
                </p>
                {i < stories.length - 1 && (
                  <div className="w-16 h-px bg-gradient-to-r from-primary/30 to-transparent mt-6 sm:mt-8" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BrandStory;
