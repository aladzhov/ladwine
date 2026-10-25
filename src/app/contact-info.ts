// Single source of truth for company contact details.
// Plain TypeScript (no Angular imports) so it can also be used by Netlify functions.

export interface ContactPhone {
  id: string;
  label: string;
  number: string;
}

export interface ContactEmail {
  id: string;
  label: string;
  address: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export const COMPANY_NAME = {
  bg: 'Винарна Ладжови',
  en: 'Ladwine Family Winery',
};

export const COMPANY_ADDRESS = {
  bg: 'село Виноградец',
  en: 'Vinogradets village',
  locality: 'Vinogradets',
  country: 'Bulgaria',
  latitude: 42.294945,
  longitude: 24.125267,
};

export const WEBSITE_URL = 'https://www.ladwine.eu';
export const WEBSITE_LABEL = 'www.ladwine.eu';

// Phones and emails are stored obfuscated (reversed, then base64) so they don't appear as plain text
// in the shipped JS bundles, which keeps simple scrapers from harvesting them.
// To encode a new value run:
//   node -e 'const v=process.argv[1];console.log(Buffer.from([...v].reverse().join("")).toString("base64"))' "+359 123456"
const decode = (encoded: string): string => [...atob(encoded)].reverse().join('');

// The first entry of each list is treated as the primary contact.
export const PHONES: ContactPhone[] = [
  { id: 'bilyana', label: 'Биляна', number: decode('NTI4MzE3Nzc4IDk1Mys=') },
  { id: 'atanas', label: 'Атанас', number: decode('ODMzNDU0ODk4IDk1Mys=') },
];

export const EMAILS: ContactEmail[] = [
  { id: 'office', label: 'Office', address: decode('dWUuZW5pd2RhbEBlY2lmZm8=') },
  { id: 'orders', label: 'Orders', address: decode('dWUuZW5pd2RhbEBzcmVkcm8=') },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61594973502143', icon: '/images/social/facebook.png' },
  { name: 'Instagram', url: 'https://www.instagram.com/ladzhovswinery', icon: '/images/social/instagram.png' },
  { name: 'YouTube', url: 'https://www.youtube.com/@ladwinery', icon: '/images/social/youtube.png' },
];

export const PRIMARY_PHONE = PHONES[0];
export const PRIMARY_EMAIL = EMAILS[0];

export function emailById(id: string): ContactEmail {
  return EMAILS.find((e) => e.id === id) ?? PRIMARY_EMAIL;
}

export function telHref(phone: ContactPhone): string {
  return `tel:${phone.number.replace(/\s/g, '')}`;
}

export function mailtoHref(email: ContactEmail): string {
  return `mailto:${email.address}`;
}
