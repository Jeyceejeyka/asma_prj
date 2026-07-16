// Asset fallback maps. Backend should ideally return absolute image URLs;
// these maps are used as a fallback when no image URL is provided.

import bottleMidnightOud from "@/assets/bottles/midnight-oud.jpg";
import bottleNoirSmoke from "@/assets/bottles/noir-smoke.jpg";
import bottleCedarDusk from "@/assets/bottles/cedar-dusk.jpg";
import bottleVelvetRose from "@/assets/bottles/velvet-rose.jpg";
import bottleBlushSatin from "@/assets/bottles/blush-satin.jpg";
import bottleIvoryGarden from "@/assets/bottles/ivory-garden.jpg";
import bottleAmberNoir from "@/assets/bottles/amber-noir.jpg";
import bottleGoldenResin from "@/assets/bottles/golden-resin.jpg";
import bottleSpicedDusk from "@/assets/bottles/spiced-dusk.jpg";
import bottleShadowMusk from "@/assets/bottles/shadow-musk.jpg";
import bottleObsidianLeather from "@/assets/bottles/obsidian-leather.jpg";
import bottleWhiteJasmine from "@/assets/bottles/white-jasmine.jpg";
import bottleSoftOrchid from "@/assets/bottles/soft-orchid.jpg";
import bottleRoyalSaffron from "@/assets/bottles/royal-saffron.jpg";
import bottleOceanBreeze from "@/assets/bottles/ocean-breeze.jpg";
import bottleCitrusVerde from "@/assets/bottles/citrus-verde.jpg";
import bottleFreshVetiver from "@/assets/bottles/fresh-vetiver.jpg";
import bottleArcticMist from "@/assets/bottles/arctic-mist.jpg";
import bottleDarkCherry from "@/assets/bottles/dark-cherry.jpg";
import bottleTobaccoVanille from "@/assets/bottles/tobacco-vanille.jpg";
import bottleSilkPowder from "@/assets/bottles/silk-powder.jpg";
import bottleSacredSandalwood from "@/assets/bottles/sacred-sandalwood.jpg";
import bottleTempleIncense from "@/assets/bottles/temple-incense.jpg";
import bottlePeonyBlush from "@/assets/bottles/peony-blush.jpg";
import bottleNeroliDawn from "@/assets/bottles/neroli-dawn.jpg";

import collectionMidnight from "@/assets/bottles/collection-midnight-oud.svg";
import collectionVelvet from "@/assets/bottles/collection-velvet-rose.svg";
import collectionAmber from "@/assets/bottles/collection-amber-noir.svg";
import collectionFresh from "@/assets/bottles/collection-fresh-waters.svg";

import placeholder from "/placeholder.png";

const slug = (s: string) =>
  s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const bottleByKey: Record<string, string> = {
  "midnight-oud": bottleMidnightOud,
  "noir-smoke": bottleNoirSmoke,
  "cedar-dusk": bottleCedarDusk,
  "velvet-rose": bottleVelvetRose,
  "blush-satin": bottleBlushSatin,
  "ivory-garden": bottleIvoryGarden,
  "amber-noir": bottleAmberNoir,
  "golden-resin": bottleGoldenResin,
  "spiced-dusk": bottleSpicedDusk,
  "shadow-musk": bottleShadowMusk,
  "obsidian-leather": bottleObsidianLeather,
  "white-jasmine": bottleWhiteJasmine,
  "soft-orchid": bottleSoftOrchid,
  "royal-saffron": bottleRoyalSaffron,
  "ocean-breeze": bottleOceanBreeze,
  "citrus-verde": bottleCitrusVerde,
  "fresh-vetiver": bottleFreshVetiver,
  "arctic-mist": bottleArcticMist,
  "dark-cherry": bottleDarkCherry,
  "tobacco-vanille": bottleTobaccoVanille,
  "silk-powder": bottleSilkPowder,
  "sacred-sandalwood": bottleSacredSandalwood,
  "temple-incense": bottleTempleIncense,
  "peony-blush": bottlePeonyBlush,
  "neroli-dawn": bottleNeroliDawn,
};

const collectionByName: Record<string, string> = {
  "Midnight Oud": collectionMidnight,
  "Velvet Rose": collectionVelvet,
  "Amber Noir": collectionAmber,
  "Fresh Waters": collectionFresh,
};

const collectionBySlug: Record<string, string> = {
  "midnight-oud": collectionMidnight,
  "velvet-rose": collectionVelvet,
  "amber-noir": collectionAmber,
  "fresh-waters": collectionFresh,
};

function buildCloudinaryUrl(maybePublicId?: string) {
  if (!maybePublicId) return undefined;
  const val = String(maybePublicId).trim();
  if (!val) return undefined;
  // If it's already an absolute URL, return as-is
  if (/^https?:\/\//i.test(val)) return val;
  // If it looks like a Cloudinary public id/path (common form: "image/upload/...." or "v123/..."), prefix with cloud name
  if (val.includes('image/upload') || /^v\d+\//.test(val) || /^[^/]+\/.+\..+$/.test(val)) {
    const cloudName = (import.meta.env && (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string)) || 'asma';
    const clean = val.replace(/^\/+/, '');
    return `https://res.cloudinary.com/${cloudName}/${clean}`;
  }
  return undefined;
}

export const resolveBottleImage = (name: string, imageKey?: string, url?: string) => {
  const cloudUrl = buildCloudinaryUrl(url);
  if (cloudUrl) return cloudUrl;
  if (url) return url;
  if (imageKey && bottleByKey[imageKey]) return bottleByKey[imageKey];
  const key = slug(name);
  return bottleByKey[key] || placeholder;
};

export const resolveCollectionImage = (name: string, url?: string) => {
  const cloudUrl = buildCloudinaryUrl(url);
  if (cloudUrl) return cloudUrl;
  if (url) {
    return url;
  }

  const cleanedName = name.trim();
  const key = slug(cleanedName);
  if (collectionByName[cleanedName]) return collectionByName[cleanedName];
  if (collectionBySlug[key]) return collectionBySlug[key];

  const keywordMapping: Record<string, string> = {
    oud: collectionMidnight,
    rose: collectionVelvet,
    amber: collectionAmber,
    fresh: collectionFresh,
    ocean: collectionFresh,
    water: collectionFresh,
  };

  for (const [keyword, image] of Object.entries(keywordMapping)) {
    if (key.includes(keyword)) return image;
  }

  return placeholder;
};
