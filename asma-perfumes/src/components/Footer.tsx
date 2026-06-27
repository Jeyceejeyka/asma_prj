import { Link } from "react-router-dom";
import { ArrowRight, Drama as Instagram, Battery as Twitter, Notebook as Facebook, Route as Youtube, Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import navData from "@/data/navigation.json";
import type { NavigationData } from "@/types/navigation";
import { useState } from "react";

const data: NavigationData = navData;

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/asmaperfumes", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com/asmaperfumes", label: "Twitter" },
  { icon: Facebook, href: "https://facebook.com/asmaperfumes", label: "Facebook" },
  { icon: Youtube, href: "https://youtube.com/asmaperfumes", label: "YouTube" },
  // tiktok icon
  // { icon: Tiktok, href: 'https://'}
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="border-t border-primary/10 bg-gradient-to-b from-background to-card/30 relative overflow-hidden">
      {/* Top Decorative Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Background Element */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.015] rounded-full blur-[150px] pointer-events-none" />

      <div className="section-padding py-16 sm:py-24 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 lg:gap-16">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-display text-3xl tracking-[0.3em] text-primary mb-4">
                ASMA
              </h3>
              <p className="text-foreground/40 text-sm font-light leading-[1.85] mb-6 max-w-xs">
                {data.brandTagline}
              </p>

              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-full border border-border/50 flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary/50 transition-all duration-300"
                    aria-label={label}
                  >
                    <Icon size={16} />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Collections Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-[10px] tracking-[0.35em] uppercase text-foreground/50 mb-5 font-body">
              Collections
            </h4>
            <div className="space-y-3">
              {data.footerCollections.map((c) => (
                <Link
                  key={c}
                  to={`/collections/${encodeURIComponent(c)}`}
                  className="block text-sm text-foreground/40 hover:text-primary transition-colors duration-300 font-light group flex items-center gap-2"
                >
                  <span className="w-0 h-[1px] bg-primary/40 group-hover:w-3 transition-all duration-300" />
                  {c}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Support Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-[10px] tracking-[0.35em] uppercase text-foreground/50 mb-5 font-body">
              Support
            </h4>
            <div className="space-y-3">
              {data.footerSupport.map((item, idx) => (
                <span
                  key={idx}
                  className="block text-sm text-foreground/40 font-light cursor-default hover:text-foreground/60 transition-colors duration-300"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Contact Info */}
            <div className="mt-6 pt-6 border-t border-border/30 space-y-2">
              <a
                href="mailto:boyoscar354@gmail.com"
                className="flex items-center gap-2 text-xs text-foreground/40 hover:text-primary transition-colors duration-300"
              >
                <Mail size={12} />
                boyoscar354@gmail.com
              </a>
              <a
                href="tel:+254768304584"
                className="flex items-center gap-2 text-xs text-foreground/40 hover:text-primary transition-colors duration-300"
              >
                <Phone size={12} />
                +254 768 304 584
              </a>
              <span className="flex items-center gap-2 text-xs text-foreground/40">
                <MapPin size={12} />
                Nairobi, Kenya
              </span>
            </div>
          </motion.div>

          {/* Newsletter Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-[10px] tracking-[0.35em] uppercase text-foreground/50 mb-3 font-body">
              Stay Connected
            </h4>
            <p className="text-foreground/35 text-xs font-light mb-5 leading-relaxed">
              {data.newsletterText}
            </p>

            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full bg-card/50 border border-border/50 px-4 py-3 pr-12 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-primary/50 focus:bg-card transition-all duration-300 rounded-lg"
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300"
              >
                <ArrowRight size={14} />
              </motion.button>
            </form>

            {subscribed && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-primary text-xs mt-3"
              >
                Thank you for subscribing!
              </motion.p>
            )}

            {/* Trust Badges */}
            <div className="mt-6 pt-4 flex items-center gap-3 text-[9px] tracking-[0.15em] uppercase text-foreground/30 font-body">
              <span className="px-2 py-1 border border-border/30 rounded">M-Pesa</span>
              <span className="px-2 py-1 border border-border/30 rounded">SSL</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/30 mt-12 sm:mt-16 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-foreground/25 text-[10px] tracking-[0.2em] order-2 sm:order-1">
              {data.copyright}
            </p>

            <div className="flex items-center gap-6 order-1 sm:order-2">
              <Link
                to="/privacy"
                className="text-[10px] tracking-wider text-foreground/30 hover:text-primary transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-[10px] tracking-wider text-foreground/30 hover:text-primary transition-colors duration-300"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
