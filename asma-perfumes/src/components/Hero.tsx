import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import GoldParticles from "@/components/GoldParticles";
import heroImage from "@/assets/hero-bottle.jpg";
import heroData from "@/data/hero.json";
import type { HeroData } from "@/types/hero";

const data: HeroData = heroData;

const Hero = () => {
  const scrollToCollection = () => {
    document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Asma Perfumes"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      </div>

      <GoldParticles />

      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
        className="absolute left-[10%] top-[15%] w-px h-32 bg-gradient-to-b from-transparent via-primary/30 to-transparent origin-top hidden lg:block"
      />
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.5, delay: 1.2 }}
        className="absolute right-[10%] bottom-[20%] w-px h-24 bg-gradient-to-b from-transparent via-primary/20 to-transparent origin-top hidden lg:block"
      />

      <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-8 sm:w-12 h-px bg-primary/50" />
            <p className="text-primary tracking-[0.4em] uppercase text-[10px] font-body font-light">
              {data.brandLabel}
            </p>
            <div className="w-8 sm:w-12 h-px bg-primary/50" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="font-display text-3xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-wide text-foreground"
        >
          {data.headlinePart1}
          <br />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="italic text-primary"
          >
            {data.headlinePart2}
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="text-foreground/40 font-light text-xs sm:text-sm md:text-base max-w-md mx-auto mt-4 sm:mt-6 leading-relaxed"
        >
          {data.subtext}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-8 sm:mt-12"
        >
          <button
            onClick={scrollToCollection}
            className="group relative btn-gold overflow-hidden"
          >
            <span className="relative z-10">{data.ctaText}</span>
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] tracking-[0.3em] uppercase text-foreground/20 font-body">{data.scrollLabel}</span>
        <button onClick={scrollToCollection} className="text-foreground/20 animate-bounce">
          <ChevronDown size={20} />
        </button>
      </motion.div>
    </section>
  );
};

export default Hero;
