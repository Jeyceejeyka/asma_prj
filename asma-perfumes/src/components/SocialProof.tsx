import { motion } from "framer-motion";
import { Quote, Star, MapPin } from "lucide-react";
import testimonialData from "@/data/testimonials.json";
import type { TestimonialData } from "@/types/testimonial";

const data: TestimonialData = testimonialData;

const SocialProof = () => {
  return (
    <section className="py-24 sm:py-36 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/40 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.02] rounded-full blur-[180px] pointer-events-none" />

      <div className="section-padding relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14 sm:mb-20"
        >
          <div className="flex items-center justify-center gap-5 mb-6">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "3rem" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-px bg-gradient-to-r from-transparent to-primary/40"
            />
            <p className="text-primary/60 text-[10px] tracking-[0.45em] uppercase font-body">
              Testimonials
            </p>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "3rem" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-px bg-gradient-to-l from-transparent to-primary/40"
            />
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-wide text-foreground"
          >
            Loved by <span className="italic text-primary">Fragrance</span> Enthusiasts
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-muted-foreground text-xs sm:text-sm tracking-[0.1em] uppercase mt-4"
          >
            {data.tagline}
          </motion.p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {data.items.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="group"
            >
              <div className="relative h-full bg-card/40 border border-border/40 rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:border-primary/30 hover:bg-card/60">
                {/* Quote Icon */}
                <div className="absolute -top-4 left-6">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Quote size={14} className="text-primary/60" />
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      size={12}
                      className="text-primary fill-primary/30"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground/50 italic font-light text-sm sm:text-base leading-[1.85] mb-6">
                  "{t.quote}"
                </p>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-border/40 via-transparent to-border/40 mb-5" />

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-primary text-sm font-display">
                      {t.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-display tracking-wider">
                      {t.name}
                    </p>
                    <p className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase flex items-center gap-1.5">
                      <MapPin size={10} className="text-primary/50" />
                      {t.location}
                    </p>
                  </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 gold-glow pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-14 sm:mt-20"
        >
          <p className="text-muted-foreground/60 text-xs tracking-[0.25em] uppercase font-body">
            Join hundreds of satisfied fragrance collectors
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;
