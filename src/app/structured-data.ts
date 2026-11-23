import {
  COMPANY_ADDRESS,
  COMPANY_NAME,
  PHONES,
  PRIMARY_EMAIL,
  SOCIAL_LINKS,
  WEBSITE_URL,
} from './contact-info';

/**
 * Adds schema.org JSON-LD describing the winery, so search engines can show it in
 * local results / knowledge panels. Built at runtime from contact-info.ts so phones and
 * emails stay out of the static HTML (Google executes JS and reads injected JSON-LD).
 */
export function injectStructuredData(document: Document): void {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Winery',
    '@id': `${WEBSITE_URL}/#winery`,
    name: COMPANY_NAME.bg,
    alternateName: COMPANY_NAME.en,
    url: WEBSITE_URL,
    logo: `${WEBSITE_URL}/images/ladwine-logo.webp`,
    image: `${WEBSITE_URL}/images/ladwine-logo.webp`,
    telephone: PHONES[0].number,
    email: PRIMARY_EMAIL.address,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Виноградец',
      addressRegion: 'Пазарджик',
      addressCountry: 'BG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: COMPANY_ADDRESS.latitude,
      longitude: COMPANY_ADDRESS.longitude,
    },
    contactPoint: PHONES.map((phone) => ({
      '@type': 'ContactPoint',
      telephone: phone.number,
      contactType: 'customer service',
      availableLanguage: ['bg', 'en'],
    })),
    sameAs: SOCIAL_LINKS.map((link) => link.url),
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}
