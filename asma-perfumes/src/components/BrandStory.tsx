import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Droplets, Compass, Award, Heart } from "lucide-react";
import brandImage from "@/assets/brand-story.jpg";
import storiesData from "@/data/brand-stories.json";
import type { BrandStoryItem } from "@/types/brand";

const stories: BrandStoryItem[] = storiesData;

const stats = [
  { icon: Droplets, value: "50+", label: "Unique Fragrances" },
  { icon: Compass, value: "100%", label: "Premium Oils" },
  { icon: Award, value: "5+", label: "Years in Business" },
  { icon: Heart, value: "1K+", label: "Happy Customers" },
];

const BrandStory = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0.6, 1]);

  return (
    <section ref={sectionRef} className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.015] rounded-full blur-[120px] pointer-events-none" />

      <div className="section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-center">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-2 lg:order-1"
          >
            {/* Main Image */}
            <motion.div
              style={{ y: imageY, scale: imageScale }}
              className="relative mx-auto max-w-lg lg:max-w-none"
            >
              <div className="relative overflow-hidden rounded-[28px]">
                <img
                  src={brandImage}
                  alt="Asma Perfumes Craftsmanship"
                  className="w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
              </div>

              {/* Decorative Border */}
              <div className="absolute inset-0 rounded-[28px] border border-primary/15 pointer-events-none" />

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 bg-primary/10 backdrop-blur-xl border border-primary/20 rounded-2xl px-6 py-4 hidden sm:block"
              >
                <p className="text-primary text-2xl sm:text-3xl font-display">2019</p>
                <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground">Est. Kenya</p>
              </motion.div>
            </motion.div>

            {/* Background Decorative Frame */}
            <div className="absolute -top-4 -left-4 w-full h-full border border-primary/8 rounded-[28px] -z-10 hidden lg:block" />
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10 sm:space-y-12 order-1 lg:order-2"
          >
            {/* Header */}
            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-primary/60 text-[10px] tracking-[0.45em] uppercase mb-5 font-body flex items-center gap-3"
              >
                <span className="w-6 h-px bg-primary/40" />
                Our Heritage
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wide text-foreground leading-[1.1]"
              >
                The Art of
                <br />
                <span className="italic text-primary">Fragrance</span>
              </motion.h2>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-20 h-px bg-gradient-to-r from-primary/50 to-transparent mt-6 origin-left"
              />
            </div>

            {/* Stories */}
            <div className="space-y-8 sm:space-y-10">
              {stories.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.15 }}
                  className="relative pl-0"
                >
                  <h4 className="text-primary text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-3 font-body font-light flex items-center gap-3">
                    <span className="w-8 h-px bg-primary/30" />
                    {item.label}
                  </h4>
                  <p className="text-foreground/45 font-light leading-[1.85] text-sm sm:text-base">
                    {item.text}
                  </p>
                  {i < stories.length - 1 && (
                    <div className="w-full h-px bg-gradient-to-r from-border/40 via-border/20 to-transparent mt-6 sm:mt-8" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/30 mt-10"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                  className="text-center group"
                >
                  <stat.icon
                    size={18}
                    className="mx-auto mb-2 text-primary/50 group-hover:text-primary transition-colors duration-300"
                  />
                  <p className="text-xl sm:text-2xl font-display text-foreground">{stat.value}</p>
                  <p className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
