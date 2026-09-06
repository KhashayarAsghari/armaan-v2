/**
 * Central, single source of truth for public site/company information.
 * All values come from environment variables — never hardcode contact
 * details, social links, etc. in components. Update `.env` to change them.
 */
export const siteConfig = {
  companyName: {
    fa: 'کارگزاران سرآمد آرمان',
    en: 'Armaan Premier Brokers',
    ar: 'وسطاء آرمان المتميزون',
  },
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE ?? '',
  mobile: process.env.NEXT_PUBLIC_COMPANY_MOBILE ?? '',
  whatsapp: process.env.NEXT_PUBLIC_COMPANY_WHATSAPP ?? process.env.NEXT_PUBLIC_COMPANY_MOBILE ?? '',
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? '',
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? '',
  mapsEmbedUrl: process.env.NEXT_PUBLIC_MAPS_EMBED_URL ?? '',
  social: {
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? '',
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? '',
    telegram: process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM ?? '',
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ?? '',
  },
} as const;
