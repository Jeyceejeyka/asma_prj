import { motion } from "framer-motion";
import testimonialData from "@/data/testimonials.json";
import type { TestimonialData } from "@/types/testimonial";

const data: TestimonialData = testimonialData;

const SocialProof = () => {
  return (
    <section className="py-16 sm:py-28 section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative text-center"
      >
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
          <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent to-primary/30" />
          <p className="text-primary/50 text-[10px] tracking-[0.4em] uppercase font-body">Testimonials</p>
          <div className="w-12 sm:w-16 h-px bg-gradient-to-l from-transparent to-primary/30" />
        </div>

        <p className="text-muted-foreground text-xs sm:text-sm tracking-[0.15em] uppercase mb-12 sm:mb-20">
          {data.tagline}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-16 max-w-5xl mx-auto">
          {data.items.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="text-center group"
            >
              <div className="text-primary/30 font-display text-4xl mb-4">"</div>
              <p className="text-foreground/45 italic font-light text-sm leading-[1.9]">
                {t.quote}
              </p>
              <div className="w-8 h-px bg-primary/20 mx-auto mt-6 mb-4 group-hover:w-12 group-hover:bg-primary/40 transition-all duration-500" />
              <p className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">
                {t.name} — {t.location}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default SocialProof;
