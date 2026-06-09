import Hero from "@/components/Hero";
import CollectionsSection from "@/components/CollectionsSection";
import ScentQuiz from "@/components/ScentQuiz";
import ProductGrid from "@/components/ProductGrid";
import BrandStory from "@/components/BrandStory";
import SocialProof from "@/components/SocialProof";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";

const Index = () => {
  useSeo({
    title: "Asma Perfumes — Luxury Fragrances Crafted in Kenya",
    description:
      "Discover Asma Perfumes: cinematic, modern fragrances priced in Kenya Shillings. Explore signature collections and take the scent quiz to find your skin scent.",
  });
  return (
    <main>
      <Hero />
      <CollectionsSection />
      <ScentQuiz />
      <ProductGrid />
      <BrandStory />
      <SocialProof />
      <Footer />
    </main>
  );
};

export default Index;
