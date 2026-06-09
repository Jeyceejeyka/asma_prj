import { useEffect } from "react";

interface SeoOptions {
  title?: string;
  description?: string;
  canonical?: string;
}

const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

/** Lightweight SEO hook — sets title, description, OG tags and canonical on mount. */
export const useSeo = ({ title, description, canonical }: SeoOptions) => {
  useEffect(() => {
    if (title) {
      const full = title.length > 60 ? title.slice(0, 57) + "…" : title;
      document.title = full;
      setMeta("og:title", full, "property");
      setMeta("twitter:title", full);
    }
    if (description) {
      const desc = description.length > 160 ? description.slice(0, 157) + "…" : description;
      setMeta("description", desc);
      setMeta("og:description", desc, "property");
      setMeta("twitter:description", desc);
    }
    const url = canonical || (typeof window !== "undefined" ? window.location.href : "");
    if (url) {
      setLink("canonical", url);
      setMeta("og:url", url, "property");
    }
    setMeta("og:type", "website", "property");
    setMeta("twitter:card", "summary_large_image");
  }, [title, description, canonical]);
};
