import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {
  COMPANY_ADDRESS,
  COMPANY_NAME,
  EMAILS,
  PHONES,
  SOCIAL_LINKS,
  WEBSITE_LABEL,
  WEBSITE_URL,
  mailtoHref,
  telHref,
} from '../contact-info';

const escapeVCard = (value: string): string => value.replace(/[\\,;]/g, (c) => `\\${c}`);

interface ContactAction {
  label: string;
  value: string;
  href: string;
  icon: string;
  external?: boolean;
}

@Component({
  selector: 'app-contacts',
  imports: [NgOptimizedImage],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css',
})
export class Contacts {
  protected readonly name = COMPANY_NAME.bg;
  protected readonly website = `${WEBSITE_URL}/winery`;
  protected readonly address = COMPANY_ADDRESS.bg;

  protected readonly actions: ContactAction[] = [
    { label: 'Website', value: WEBSITE_LABEL, href: this.website, icon: 'language', external: true },
    ...EMAILS.filter((email) => email.id === 'office').map((email) => ({ label: email.label, value: email.address, href: mailtoHref(email), icon: 'mail' })),
    {
      label: 'Directions',
      value: this.address,
      href: this.mapsUrl(),
      icon: 'place',
      external: true,
    },
    ...PHONES.map((phone) => ({ label: phone.label, value: phone.number, href: telHref(phone), icon: 'call' })),
  ];

  protected readonly socialLinks = SOCIAL_LINKS;

  // iOS: maps.apple.com opens Apple Maps. Elsewhere: the Google Maps universal link opens the Google Maps app (Android) or the web.
  private mapsUrl(): string {
    const coords = `${COMPANY_ADDRESS.latitude},${COMPANY_ADDRESS.longitude}`;
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return isIos
      ? `https://maps.apple.com/?ll=${coords}&q=${encodeURIComponent(this.name)}`
      : `https://www.google.com/maps/search/?api=1&query=${coords}`;
  }

  protected saveContact(): void {
    // Grouped "itemN." properties with X-ABLabel give each phone/email a custom label (e.g. a person's name).
    let item = 0;
    const labelled = (property: string, label: string): string[] => {
      item++;
      return [`item${item}.${property}`, `item${item}.X-ABLabel:${escapeVCard(label)}`];
    };

    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${escapeVCard(this.name)}`,
      `ORG:${escapeVCard(this.name)}`,
      ...PHONES.flatMap((phone) => labelled(`TEL;TYPE=WORK,VOICE:${phone.number}`, phone.label)),
      ...EMAILS.flatMap((email) => labelled(`EMAIL;TYPE=WORK:${email.address}`, email.label)),
      `URL:${WEBSITE_URL}`,
      `ADR;TYPE=WORK:;;${COMPANY_ADDRESS.locality};;;;${COMPANY_ADDRESS.country}`,
      `GEO:${COMPANY_ADDRESS.latitude};${COMPANY_ADDRESS.longitude}`,
      'END:VCARD',
    ].join('\r\n');

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ladwine.vcf';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
