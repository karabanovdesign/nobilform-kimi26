export interface SeoArticleData {
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: { h2: string; text: string }[];
  advantages?: string[];
  aiBlock?: string;
  portfolioImages?: { src: string; alt: string }[];
  faq: { q: string; a: string }[];
  relatedMaterials: { label: string; href: string }[];
  ctaWhatsAppText?: string;
  ctaAiText?: string;
  lang: "ru" | "ro";
  slug: string;
}
