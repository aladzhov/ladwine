import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

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
  protected readonly name = 'Ladwine Family Winery';
  protected readonly phone = '+359 12345';
  protected readonly email = 'office@ladwine.eu';
  protected readonly website = 'https://www.ladwine.eu';
  protected readonly address = 'Vinogradets village, Bulgaria';

  protected readonly actions: ContactAction[] = [
    { label: 'Website', value: 'www.ladwine.eu', href: this.website, icon: 'language', external: true },
    { label: 'Call', value: this.phone, href: `tel:${this.phone.replace(/\s/g, '')}`, icon: 'call' },
    { label: 'Email', value: this.email, href: `mailto:${this.email}`, icon: 'mail' },
    {
      label: 'Directions',
      value: this.address,
      href: this.mapsUrl(this.address),
      icon: 'place',
      external: true,
    },
  ];

  protected readonly socialLinks = [
    { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61594973502143', icon: '/images/social/facebook.png' },
    { name: 'Instagram', url: 'https://www.instagram.com/ladzhovswinery', icon: '/images/social/instagram.png' },
    { name: 'YouTube', url: 'https://www.youtube.com/@ladwinery', icon: '/images/social/youtube.png' },
    { name: 'Discord', url: 'https://discord.gg/5R43pmZ5', icon: '/images/social/discord.png' },
  ];

  // iOS: maps.apple.com opens Apple Maps. Elsewhere: the Google Maps universal link opens the Google Maps app (Android) or the web.
  private mapsUrl(query: string): string {
    const q = encodeURIComponent(query);
    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return isIos ? `https://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`;
  }

  protected saveContact(): void {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${this.name}`,
      `ORG:${this.name}`,
      `TEL;TYPE=WORK,VOICE:${this.phone}`,
      `EMAIL;TYPE=WORK:${this.email}`,
      `URL:${this.website}`,
      'ADR;TYPE=WORK:;;Vinogradets;;;;Bulgaria',
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
