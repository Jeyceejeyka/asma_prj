import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import navData from "@/data/navigation.json";
import type { NavigationData } from "@/types/navigation";

const data: NavigationData = navData;

const Footer = () => {
  return (
    <footer className="border-t border-primary/15 bg-background relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="section-padding py-12 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 lg:gap-16">
          <div>
            <h3 className="font-display text-2xl tracking-[0.25em] text-primary mb-5">ASMA</h3>
            <p className="text-foreground/35 text-sm font-light leading-[1.8]">
              {data.brandTagline}
            </p>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-foreground/40 mb-5">Collections</h4>
            <div className="space-y-3">
              {data.footerCollections.map((c) => (
                <Link
                  key={c}
                  to={`/collections/${encodeURIComponent(c)}`}
                  className="block text-sm text-foreground/35 hover:text-primary transition-colors duration-400 font-light"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-foreground/40 mb-5">Support</h4>
            <div className="space-y-3">
              {data.footerSupport.map((item) => (
                <span key={item} className="block text-sm text-foreground/35 font-light cursor-default">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-foreground/40 mb-5">Stay Connected</h4>
            <p className="text-foreground/25 text-xs font-light mb-4 leading-relaxed">
              {data.newsletterText}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 min-w-0 bg-transparent border border-border/60 px-4 py-2.5 text-sm text-foreground/60 placeholder:text-foreground/20 focus:outline-none focus:border-primary/40 transition-colors duration-400 rounded-sm"
              />
              <button className="px-3.5 border border-border/60 hover:border-primary hover:text-primary text-foreground/40 transition-all duration-400 rounded-sm shrink-0">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 mt-12 sm:mt-16 pt-8 text-center">
          <p className="text-foreground/20 text-[11px] tracking-[0.2em]">
            {data.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
