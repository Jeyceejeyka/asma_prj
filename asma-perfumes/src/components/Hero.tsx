import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { useRef } from "react";
import GoldParticles from "@/components/GoldParticles";
import heroImage from "@/assets/hero-bottle.jpg";
import heroData from "@/data/hero.json";
import type { HeroData } from "@/types/hero";

const data: HeroData = heroData;

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0.85]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, 80]);

  const scrollToCollection = () => {
    document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div className="absolute inset-0" style={{ y: imageY, scale: imageScale }}>
        <img
          src={heroImage}
          alt="Asma Perfumes"
          className="w-full h-[120%] object-cover object-center opacity-50"
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background"
          style={{ opacity: overlayOpacity }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      </motion.div>

      {/* Subtle Vignette */}
      <div className="absolute inset-0 radial-vignette pointer-events-none" />

      {/* Gold Particles */}
      <GoldParticles />

      {/* Decorative Lines */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 1.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-[8%] top-[12%] w-px h-40 bg-gradient-to-b from-transparent via-primary/25 to-transparent origin-top hidden lg:block"
      />
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 1.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-[8%] bottom-[18%] w-px h-32 bg-gradient-to-t from-transparent via-primary/20 to-transparent origin-top hidden lg:block"
      />

      {/* Decorative Corner Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, delay: 1.5 }}
        className="absolute top-[10%] left-[5%] hidden xl:block"
      >
        <div className="w-16 h-16 border-l border-t border-primary/15 rounded-tl-lg" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, delay: 1.7 }}
        className="absolute bottom-[15%] right-[5%] hidden xl:block"
      >
        <div className="w-16 h-16 border-r border-b border-primary/15 rounded-br-lg" />
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 text-center max-w-5xl mx-auto px-6 sm:px-8"
        style={{ y: textY }}
      >
        {/* Brand Label with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex items-center justify-center gap-5 mb-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "3rem" }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="h-px bg-gradient-to-r from-transparent to-primary/40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-2"
            >
              <Sparkles size={12} className="text-primary/50" />
              <p className="text-primary tracking-[0.45em] uppercase text-[10px] font-body font-light">
                {data.brandLabel}
              </p>
              <Sparkles size={12} className="text-primary/50" />
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "3rem" }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="h-px bg-gradient-to-l from-transparent to-primary/40"
            />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] tracking-wide text-foreground"
        >
          <span className="block">{data.headlinePart1}</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.2 }}
            className="block italic text-primary mt-2"
          >
            {data.headlinePart2}
          </motion.span>
        </motion.h1>

        {/* Decorative Underline */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-32 h-[1px] mx-auto mt-8 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        />

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="text-foreground/40 font-light text-sm sm:text-base md:text-lg max-w-lg mx-auto mt-6 sm:mt-8 leading-relaxed tracking-wide"
        >
          {data.subtext}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.6 }}
          className="mt-10 sm:mt-14"
        >
          <button
            onClick={scrollToCollection}
            className="group relative btn-gold overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {data.ctaText}
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} className="rotate-[-90deg]" />
              </motion.span>
            </span>
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px] h-8 bg-gradient-to-b from-primary/40 to-transparent"
        />
        <button onClick={scrollToCollection} className="group flex flex-col items-center gap-2">
          <span className="text-[9px] tracking-[0.35em] uppercase text-foreground/25 font-body group-hover:text-primary/50 transition-colors duration-300">
            {data.scrollLabel}
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-foreground/25 group-hover:text-primary/50 transition-colors"
          >
            <ChevronDown size={16} strokeWidth={1.5} />
          </motion.div>
        </button>
      </motion.div>

      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-[100px]" />
      </div>
    </section>
  );
};

export default Hero;
