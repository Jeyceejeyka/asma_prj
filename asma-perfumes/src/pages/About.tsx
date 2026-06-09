import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Droplets, Gem, Globe, Heart, Sparkles, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Footer from "@/components/Footer";
import aboutData from "@/data/about.json";
import type { AboutData } from "@/types/about";
import { useSeo } from "@/hooks/useSeo";

const data: AboutData = aboutData;

const iconMap: Record<string, LucideIcon> = {
  Gem,
  Heart,
  Globe,
  Sparkles,
  Star,
};

const About = () => {
  useSeo({
    title: "About Asma Perfumes — The House Behind the Scent",
    description: "Born from Asma to Asma Perfumes — a Kenyan fragrance house dedicated to slow craft, modern minimalism and skin-scent intimacy.",
  });
  return (
    <main className="pt-20 sm:pt-24">
      {/* Hero */}
      <section className="section-padding pb-0">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm mb-8 sm:mb-12">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-primary/60 text-[10px] tracking-[0.4em] uppercase mb-4 font-body">{data.hero.subtitle}</p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl tracking-wider leading-[1.1]">
              {data.hero.titleLine1}
              <br />
              <span className="italic text-primary">{data.hero.titleHighlight}</span> {data.hero.titleLine2}
            </h1>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6 sm:mt-8" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-muted-foreground font-light text-sm sm:text-lg max-w-2xl mx-auto mt-6 sm:mt-8 leading-relaxed"
          >
            {data.hero.description}
          </motion.p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="section-padding py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto"
        >
          {data.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center p-4 sm:p-6 border border-border/40 rounded-xl bg-card/30"
            >
              <p className="font-display text-2xl sm:text-3xl md:text-4xl text-primary">{stat.value}</p>
              <p className="text-muted-foreground text-[10px] sm:text-xs tracking-[0.2em] uppercase mt-2 font-body">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Philosophy */}
      <section className="section-padding py-14 sm:py-20 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 sm:mb-16"
          >
            <p className="text-primary/60 text-[10px] tracking-[0.4em] uppercase mb-4 font-body">What Drives Us</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-5xl tracking-wider">Our Philosophy</h2>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto mt-6" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {data.values.map((v, i) => {
              const Icon = iconMap[v.iconName] || Gem;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                  className="group text-center p-6 sm:p-8 border border-border/30 rounded-xl hover:border-primary/30 transition-all duration-500 bg-background/50"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-primary/20 text-primary mb-4 sm:mb-6 group-hover:bg-primary/10 transition-colors duration-500">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-base sm:text-lg tracking-wider mb-2 sm:mb-3">{v.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm font-light leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founder Quote */}
      <section className="section-padding py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <Droplets size={32} className="text-primary/30 mx-auto mb-6 sm:mb-8" />
          <blockquote className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl italic tracking-wide leading-relaxed text-foreground/80">
            "{data.founderQuote.quote}"
          </blockquote>
          <div className="mt-6 sm:mt-8">
            <p className="font-display text-lg text-primary tracking-wider">{data.founderQuote.name}</p>
            <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase mt-1 font-body">{data.founderQuote.title}</p>
          </div>
        </motion.div>
      </section>

      {/* Timeline / Journey */}
      <section className="section-padding py-14 sm:py-20 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 sm:mb-16"
          >
            <p className="text-primary/60 text-[10px] tracking-[0.4em] uppercase mb-4 font-body">Our Journey</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-5xl tracking-wider">Milestones</h2>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto mt-6" />
          </motion.div>

          <div className="relative">
            <div className="absolute left-6 sm:left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />

            <div className="space-y-8 sm:space-y-12">
              {data.milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className={`relative flex items-start gap-4 sm:gap-6 md:gap-12 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className={`flex-1 pl-12 sm:pl-16 md:pl-0 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <span className="font-display text-xl sm:text-2xl text-primary">{m.year}</span>
                    <h3 className="font-display text-base sm:text-lg tracking-wider mt-1">{m.title}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm font-light leading-relaxed mt-2">{m.desc}</p>
                  </div>
                  <div className="absolute left-6 sm:left-8 md:left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-background border-2 border-primary/40 mt-2" />
                  <div className="hidden md:block flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 sm:mb-16"
          >
            <p className="text-primary/60 text-[10px] tracking-[0.4em] uppercase mb-4 font-body">Behind the Scenes</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-5xl tracking-wider">Our Process</h2>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto mt-6" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {data.process.map((item, i) => {
              const Icon = iconMap[item.iconName] || Gem;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="relative p-6 sm:p-8 border border-border/30 rounded-xl"
                >
                  <span className="font-display text-4xl sm:text-5xl text-primary/10 absolute top-4 right-6">{item.step}</span>
                  <Icon size={24} className="text-primary mb-4" strokeWidth={1.5} />
                  <h3 className="font-display text-lg sm:text-xl tracking-wider mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm font-light leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding py-16 sm:py-24 bg-card/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wider mb-4 sm:mb-6">
            {data.cta.title} <span className="italic text-primary">{data.cta.highlight}</span>
          </h2>
          <p className="text-muted-foreground font-light mb-8 sm:mb-10 leading-relaxed text-sm sm:text-base">
            {data.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-gold-solid text-center">
              Explore Collections
            </Link>
            <Link to="/wishlist" className="btn-gold text-center">
              View Wishlist
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
};

export default About;
